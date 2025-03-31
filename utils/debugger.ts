import type { LogRule } from '@/entrypoints/sidepanel/modules/store/use-logs-store'
import { sendMessage } from '@/utils/messaging'
import { getTodosRepo } from '@/utils/service'

// Debugger会话管理
interface DebuggerSession {
  tabId: number
  active: boolean
}

// 保存活跃的debugger会话
export const debuggerSessions: Map<number, DebuggerSession> = new Map()

// 激活特定标签页的debugger
export async function activateDebugger(tabId: number) {
  console.log('activateDebugger', tabId)
  try {
    // 如果此标签页已有debugger会话，先分离
    if (debuggerSessions.has(tabId)) {
      await browser.debugger.detach({ tabId })
      console.log('detach', tabId)
    }

    // 附加debugger
    await browser.debugger.attach({ tabId }, '1.3')

    // 启用网络请求跟踪
    await browser.debugger.sendCommand({ tabId }, 'Network.enable')

    // 启用Fetch域，用于拦截请求
    await browser.debugger.sendCommand({ tabId }, 'Fetch.enable', {
      patterns: [{ urlPattern: '*' }],
    })
    console.log('enable', tabId)
    // 记录会话
    debuggerSessions.set(tabId, { tabId, active: true })

    console.log(`成功为标签页 ${tabId} 附加调试器`)
    console.log('debuggerSessions', debuggerSessions)
    return true
  }
  catch (error) {
    console.error(`激活调试器失败:`, error)
    return false
  }
}

// 停用特定标签页的debugger
export async function deactivateDebugger(tabId: number) {
  try {
    if (debuggerSessions.has(tabId)) {
      await browser.debugger.detach({ tabId })
      debuggerSessions.delete(tabId)
      console.log(`成功从标签页 ${tabId} 分离调试器`)
      return true
    }
    return false
  }
  catch (error) {
    console.error(`停用调试器失败:`, error)
    return false
  }
}
// 停用所有debugger
export async function deactivateAllDebugger() {
  debuggerSessions.forEach((session) => {
    deactivateDebugger(session.tabId)
  })
}

// 查找匹配URL的规则
export async function findMatchingRule(url: string): Promise<LogRule | undefined> {
  const todo = getTodosRepo()
  const rules = await todo.getAll()
  console.log('rules', rules)
  return rules.find((rule) => {
    // 简单匹配URL，可以根据需要扩展为正则匹配
    return rule.active && url.includes(rule.url)
  })
}

// 处理mock响应
export async function handleMockResponse(tabId: number, requestId: string, rule: LogRule) {
  try {
    // 解析响应数据
    const responseBody = rule.response

    // 使用 UTF-8 编码处理响应体
    const encodedBody = btoa(
      Array.from(new TextEncoder().encode(responseBody))
        .map(byte => String.fromCharCode(byte))
        .join(''),
    )

    // 使用Fetch.fulfillRequest返回mock数据
    await browser.debugger.sendCommand({ tabId }, 'Fetch.fulfillRequest', {
      requestId,
      responseCode: Number.parseInt(rule.status) || 200,
      responseHeaders: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Access-Control-Allow-Origin', value: '*' },
      ],
      body: encodedBody, // 使用编码后的响应体
    })

    console.log(`成功mock请求: ${rule.url}`)
    return true
  }
  catch (error) {
    console.error(`处理mock响应失败:`, error)
    return false
  }
}

// 处理调试器事件
export async function handleDebuggerEvent(debuggerId: any, method: string, params: any) {
  const { tabId } = debuggerId

  if (method === 'Fetch.requestPaused') {
    const { requestId, request } = params

    // 检查是否有匹配的mock规则
    const matchedRule = await findMatchingRule(request.url)
    console.log('matchedRule', matchedRule)
    if (matchedRule && matchedRule.active) {
      // 拦截并返回mock数据
      return handleMockResponse(tabId!, requestId, matchedRule)
    }
    else {
      // 继续请求，无需打印日志
      return browser.debugger.sendCommand({ tabId }, 'Fetch.continueRequest', { requestId })
    }
  }
  else if (method === 'Network.requestWillBeSent') {
    // 移除不必要的日志
  }
  // 只保留响应完成的打印信息
  else if (method === 'Network.responseReceived') {
    const { requestId, response } = params

    try {
      // 获取响应体
      const responseBodyResult = await browser.debugger.sendCommand({ tabId }, 'Network.getResponseBody', { requestId })
      const responseBody = responseBodyResult && 'body' in responseBodyResult ? responseBodyResult.body : ''

      // 检查是否有匹配的mock规则
      const matchedRule = await findMatchingRule(response.url)
      const isMocked = Boolean(matchedRule?.active)

      // 发送完整信息到侧边栏（也排除socket请求）
      await sendMessage('sendToSidePanel', {
        url: response.url,
        status: response.status,
        mock: isMocked,
        type: 'xhr',
        payload: await getRequestPayload(tabId, requestId),
        response: responseBody,
      })
    }
    catch (error) {
      // 保留错误日志，便于调试
      console.error(`获取响应体失败:`, error)
    }
  }
  else if (method === 'Network.loadingFinished') {
    console.log('Network.loadingFinished')
  }

  return Promise.resolve()
}

// 清理指定标签页的debugger会话
export function cleanupDebuggerSession(tabId: number) {
  if (debuggerSessions.has(tabId)) {
    debuggerSessions.delete(tabId)
    console.log(`标签页 ${tabId} 关闭，已清理调试器会话`)
    return true
  }
  return false
}

// 获取特定标签页的调试状态
export async function getDebuggerStatus(tabId: number): Promise<DebuggerSession> {
  try {
    // 获取所有活跃的调试器目标
    const targets = await browser.debugger.getTargets()
    console.log('targets', targets)
    // 查找是否存在匹配的tabId的活跃调试会话
    const activeTarget = targets.find(target =>
      target.tabId === tabId && target.attached === true,
    )

    // 如果找到匹配的活跃调试会话，返回活跃状态
    if (activeTarget) {
      // 同步更新本地缓存
      const session = { tabId, active: true }
      debuggerSessions.set(tabId, session)
      return session
    }
    else {
      // 如果没有找到，返回非活跃状态
      // 同步更新本地缓存
      if (debuggerSessions.has(tabId)) {
        debuggerSessions.delete(tabId)
      }
      return { tabId, active: false }
    }
  }
  catch (error) {
    console.error(`获取调试器状态失败:`, error)
    return { tabId, active: false }
  }
}

// 获取所有活跃的调试会话
export async function getAllDebuggerSessions(): Promise<DebuggerSession[]> {
  try {
    const targets = await browser.debugger.getTargets()
    console.log('targets', targets)
    const activeSessions = targets
      .filter(target => target.attached === true && target.tabId !== undefined)
      .map(target => ({ tabId: target.tabId!, active: true }))

    // 同步更新本地缓存
    debuggerSessions.clear()
    activeSessions.forEach((session) => {
      debuggerSessions.set(session.tabId, session)
    })

    return activeSessions
  }
  catch (error) {
    console.error(`获取所有调试会话失败:`, error)
    return []
  }
}

// 获取请求的payload数据
async function getRequestPayload(tabId: number, requestId: string): Promise<string> {
  try {
    // 获取请求详情
    const requestDetails = await browser.debugger.sendCommand(
      { tabId },
      'Network.getRequestPostData',
      { requestId },
    )

    // 如果有postData，返回它
    if (requestDetails && 'postData' in requestDetails) {
      return requestDetails.postData
    }

    return ''
  }
  catch (error) {
    console.error('获取请求payload失败:', error)
    return ''
  }
}
