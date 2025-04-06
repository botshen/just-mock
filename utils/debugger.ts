import type { LogRule } from '@/entrypoints/sidepanel/modules/store/use-logs-store'
import type { RerouteRule } from '@/utils/service'
import { sendMessage } from '@/utils/messaging'
import { getRerouteRepo, getTodosRepo } from '@/utils/service'
import { totalSwitch } from '@/utils/storage'
// Debugger会话管理
interface DebuggerSession {
  tabId: number
  active: boolean
}
export async function doDebugger() {
  if (!(await totalSwitch.getValue())) {
    await deactivateAllDebugger()
    return
  }
  const todoRepo = getTodosRepo()
  const todos = await todoRepo.getAll()
  console.log('todos', todos)
  const rerouteRepo = getRerouteRepo()
  const reroutes = await rerouteRepo.getAll()
  console.log('reroutes', reroutes)
  if (todos.length === 0 && reroutes.length === 0) {
    await deactivateAllDebugger()
    return
  }
  if (todos.every(todo => !todo.active) && reroutes.every(reroute => !reroute.enabled)) {
    await deactivateAllDebugger()
    return
  }
  await activateAllDebugger()
}
export async function activateAllDebugger() {
  if (!(await totalSwitch.getValue())) {
    return
  }
  const todoRepo = getTodosRepo()
  const todos = await todoRepo.getAll()
  const rerouteRepo = getRerouteRepo()
  const reroutes = await rerouteRepo.getAll()
  // if (todos.length === 0 && reroutes.length === 0) {
  //   return
  // }
  // if (todos.every(todo => !todo.active) && reroutes.every(reroute => !reroute.enabled)) {
  //   return
  // }
  const tabs = await browser.tabs.query({ currentWindow: true })
  for (const tab of tabs) {
    if (tab.id) {
      await activateDebugger(tab.id)
    }
  }
}
// 激活特定标签页的debugger
export async function activateDebugger(tabId: number) {
  try {
    // 直接尝试分离可能存在的调试器
    try {
      await browser.debugger.detach({ tabId })
    }
    catch (e) {
      // 忽略错误，可能本来就没有附加的调试器
    }

    // 附加新的调试器
    await browser.debugger.attach({ tabId }, '1.3')
    await browser.debugger.sendCommand({ tabId }, 'Network.enable')
    await browser.debugger.sendCommand({ tabId }, 'Fetch.enable', {
      patterns: [{ urlPattern: '*' }],
    })

    // tabId 的url
    const tab = await browser.tabs.get(tabId)
    const url = tab.url
    console.log(`成功为标签页 ${url} 附加调试器`)

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
    await browser.debugger.detach({ tabId })
    return true
  }
  catch (error) {
    console.error(`停用调试器失败:`, error)
    return false
  }
}

// 停用所有debugger
export async function deactivateAllDebugger() {
  const targets = await browser.debugger.getTargets()
  const attachedTargets = targets.filter(target => target.attached)

  for (const target of attachedTargets) {
    if (target.tabId) {
      await deactivateDebugger(target.tabId)
    }
  }
}

// 查找匹配URL的规则
export async function findMatchingRule(url: string): Promise<LogRule | undefined> {
  const todo = getTodosRepo()
  const rules = await todo.getAll()
  return rules.find((rule) => {
    // 简单匹配URL，可以根据需要扩展为正则匹配
    return rule.active && url.includes(rule.url)
  })
}

// 查找匹配URL的reroute规则
export async function findMatchingRerouteRule(url: string): Promise<RerouteRule | undefined> {
  const rerouteRepo = getRerouteRepo()
  const rules = await rerouteRepo.getAll()

  return rules.find((rule) => {
    if (!rule.enabled)
      return false

    if (rule.urlType === 'REGEX') {
      try {
        const regex = new RegExp(rule.url)
        return regex.test(url)
      }
      catch (error) {
        console.error('Invalid regex pattern:', rule.url)
        return false
      }
    }
    else {
      // PLAIN 类型使用精确匹配
      return url === rule.url
    }
  })
}

// 处理mock响应
export async function handleMockResponse(tabId: number, requestId: string, rule: LogRule) {
  try {
    // 如果设置了延迟，先等待指定时间
    const delayMs = Number(rule.delay)
    if (delayMs && delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }

    const responseBody = rule.response
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

// 处理reroute响应
export async function handleRerouteResponse(tabId: number, requestId: string, rule: RerouteRule, request: { headers: Record<string, string>, url: string }) {
  const headersArray = Object.entries(request.headers).map(([name, value]) => ({
    name,
    value: String(value),
  }))

  // 处理正则替换
  let targetUrl = rule.rerouteUrl
  if (rule.urlType === 'REGEX') {
    const regex = new RegExp(rule.url)
    const matches = request.url.match(regex)
    if (matches) {
      // 使用正则替换，matches[1]对应$1，matches[2]对应$2，以此类推
      targetUrl = rule.rerouteUrl.replace(/\$(\d+)/g, (_, index) => matches[index] || '')
    }
  }

  return browser.debugger.sendCommand({ tabId }, 'Fetch.continueRequest', {
    requestId,
    url: targetUrl,
    headers: headersArray,
  })
}

// 处理调试器事件
export async function handleDebuggerEvent(debuggerId: any, method: string, params: any) {
  const { tabId } = debuggerId
  // 打印tab的url
  const tab = await browser.tabs.get(tabId)
  const url = tab.url
  console.log(`tab的url: ${url}`)

  if (method === 'Fetch.requestPaused') {
    const { requestId, request } = params

    // 检查是否有匹配的mock规则
    const matchedRule = await findMatchingRule(request.url)
    if (matchedRule && matchedRule.active) {
      // 拦截并返回mock数据
      return handleMockResponse(tabId!, requestId, matchedRule)
    }
    // 检查是否有匹配的reroute规则
    const matchedRerouteRule = await findMatchingRerouteRule(request.url)
    if (matchedRerouteRule && matchedRerouteRule.enabled) {
      // 拦截并返回reroute数据
      return handleRerouteResponse(tabId!, requestId, matchedRerouteRule, request)
    }

    // 继续请求
    return browser.debugger.sendCommand({ tabId }, 'Fetch.continueRequest', { requestId })
  }
  else if (method === 'Network.responseReceived') {
    const { requestId, response } = params
    try {
      // 获取响应体
      const responseBodyResult = await browser.debugger.sendCommand({ tabId }, 'Network.getResponseBody', { requestId })
      const responseBody = responseBodyResult && 'body' in responseBodyResult ? responseBodyResult.body : ''
      // 检查是否有匹配的mock规则
      const matchedRule = await findMatchingRule(response.url)
      const isMocked = Boolean(matchedRule?.active)
      const requestType = response.mimeType
      if (requestType === 'application/json') {
        // 发送完整信息到侧边栏
        await sendMessage('sendToSidePanel', {
          url: response.url,
          status: response.status,
          mock: isMocked,
          type: 'xhr',
          payload: await getRequestPayload(tabId, requestId),
          response: responseBody,
        })
      }
    }
    catch (error) {
      // 保留错误日志，便于调试
      console.error(`获取响应体失败:`, error)
    }
  }

  return Promise.resolve()
}

// 获取特定标签页的调试状态
export async function getDebuggerStatus(tabId: number): Promise<DebuggerSession> {
  try {
    const targets = await browser.debugger.getTargets()
    console.log('targets', targets)

    const activeTarget = targets.find(target => target.tabId === tabId && target.attached === true)

    if (!activeTarget) {
      return { tabId, active: false }
    }

    try {
      // 检查 Network 和 Fetch 是否启用
      await browser.debugger.sendCommand({ tabId }, 'Network.enable')
      await browser.debugger.sendCommand({ tabId }, 'Fetch.enable', {
        patterns: [{ urlPattern: '*' }],
      })
      return { tabId, active: true }
    }
    catch (error) {
      console.error('调试器功能未完全启用:', error)
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
    return targets
      .filter(target => target.attached === true && target.tabId !== undefined)
      .map(target => ({
        tabId: target.tabId!,
        active: true,
      }))
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
      return requestDetails.postData as string
    }

    return ''
  }
  catch (error) {
    console.error('获取请求payload失败:', error)
    return ''
  }
}

export async function shouldActivateDebugger(tabId: number) {
  if (!(await totalSwitch.getValue())) {
    return
  }
  const rerouteRepo = getRerouteRepo()
  const reroutes = await rerouteRepo.getAll()
  const todosRepo = getTodosRepo()
  const todos = await todosRepo.getAll()

  const hasEnabledRules = reroutes.some(rule => rule.enabled)
  const hasEnabledTodos = todos.some(todo => todo.active)

  if (hasEnabledRules || hasEnabledTodos) {
    await activateAllDebugger()
  }
}
