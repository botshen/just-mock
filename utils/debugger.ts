import type { LogRule } from '@/entrypoints/sidepanel/modules/store/use-logs-store'

// Debugger会话管理
interface DebuggerSession {
  tabId: number
  active: boolean
}

// 保存活跃的debugger会话
const debuggerSessions: Map<number, DebuggerSession> = new Map()

// 激活特定标签页的debugger
export async function activateDebugger(tabId: number) {
  try {
    // 如果此标签页已有debugger会话，先分离
    if (debuggerSessions.has(tabId)) {
      await browser.debugger.detach({ tabId })
    }

    // 附加debugger
    await browser.debugger.attach({ tabId }, '1.3')

    // 启用网络请求跟踪
    await browser.debugger.sendCommand({ tabId }, 'Network.enable')

    // 启用Fetch域，用于拦截请求
    await browser.debugger.sendCommand({ tabId }, 'Fetch.enable', {
      patterns: [{ urlPattern: '*' }],
    })

    // 记录会话
    debuggerSessions.set(tabId, { tabId, active: true })

    console.log(`成功为标签页 ${tabId} 附加调试器`)
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
  console.log('rule-=-=-', rule)
  try {
    // 解析响应数据
    const responseBody = rule.response

    // 解析状态码，默认200
    const statusCode = Number.parseInt(rule.status) || 200

    // 计算延迟
    const delay = Number.parseInt(rule.delay) || 0

    // 如果设置了延迟，等待指定时间
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    // 使用Fetch.fulfillRequest返回mock数据
    await browser.debugger.sendCommand({ tabId }, 'Fetch.fulfillRequest', {
      requestId,
      responseCode: statusCode,
      responseHeaders: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Access-Control-Allow-Origin', value: '*' },
      ],
      body: btoa(responseBody), // 转为base64
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
export async function handleDebuggerEvent(debuggeeId: any, method: string, params: any) {
  const { tabId } = debuggeeId

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

    // 过滤掉包含socket的路径
    if (response.url.includes('socket')) {
      return Promise.resolve()
    }

    try {
      // 获取响应体
      const responseBodyResult = await browser.debugger.sendCommand({ tabId }, 'Network.getResponseBody', { requestId })
      const responseBody = responseBodyResult.body || ''

      // 检查是否有匹配的mock规则
      const matchedRule = await findMatchingRule(response.url)
      const isMocked = Boolean(matchedRule?.active)

      // 发送完整信息到侧边栏（也排除socket请求）
      await sendMessage('sendToSidePanel', {
        url: response.url,
        status: response.status,
        mock: isMocked,
        type: 'xhr',
        payload: '',
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
