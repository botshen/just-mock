import type { LogRule } from '@/entrypoints/sidepanel/modules/store/use-logs-store'

// Debugger会话管理
interface DebuggerSession {
  tabId: number
  active: boolean
}

// 保存当前的mock规则
let mockRules: LogRule[] = []
// 保存活跃的debugger会话
const debuggerSessions: Map<number, DebuggerSession> = new Map()
// 请求ID到Mock规则的映射
const requestMockMap: Map<string, LogRule> = new Map()

// 初始化mock规则
export function initMockRules(rules: LogRule[]) {
  mockRules = rules
}

// 更新mock规则
export function updateMockRules(rules: LogRule[]) {
  mockRules = rules
  updateDebuggerInterception()
}

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

// 更新所有活跃debugger会话的拦截规则
function updateDebuggerInterception() {
  // 对于每个活跃的debugger会话，重新设置拦截
  debuggerSessions.forEach(async (session) => {
    if (session.active) {
      try {
        // 获取活跃的规则
        const activeRules = mockRules.filter(rule => rule.active)

        // 如果有活跃规则，设置拦截
        if (activeRules.length > 0) {
          console.log(`为标签页 ${session.tabId} 更新 ${activeRules.length} 条拦截规则`)
        }
      }
      catch (error) {
        console.error(`更新标签页 ${session.tabId} 的拦截规则失败:`, error)
      }
    }
  })
}

// 查找匹配URL的规则
export function findMatchingRule(url: string): LogRule | undefined {
  console.log('mockRules', mockRules)
  return mockRules.find((rule) => {
    // 简单匹配URL，可以根据需要扩展为正则匹配
    return rule.active && url.includes(rule.url)
  })
}

// 处理mock响应
export async function handleMockResponse(tabId: number, requestId: string, rule: LogRule) {
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
export function handleDebuggerEvent(debuggeeId: any, method: string, params: any) {
  const { tabId } = debuggeeId
  console.log('method=====', method)
  // 处理Fetch请求拦截
  if (method === 'Fetch.requestPaused') {
    const { requestId, request } = params

    // 检查是否有匹配的mock规则
    const matchedRule = findMatchingRule(request.url)

    if (matchedRule && matchedRule.active) {
      // 记录请求与规则的对应关系
      requestMockMap.set(requestId, matchedRule)

      // 拦截并返回mock数据
      return handleMockResponse(tabId!, requestId, matchedRule)
    }
    else {
      // 继续请求
      return browser.debugger.sendCommand({ tabId }, 'Fetch.continueRequest', { requestId })
    }
  }
  // 处理XHR请求拦截
  if (method === 'Network.requestWillBeSent') {
    console.log('params', params)
    const { request } = params
    const matchedRule = findMatchingRule(request.url)

    if (matchedRule && matchedRule.active) {
      // 记录请求与规则的对应关系
      requestMockMap.set(request.requestId, matchedRule)

      // 拦截并返回mock数据
      return handleMockResponse(tabId!, request.requestId, matchedRule)
    }
    else {
      // 继续请求
      return browser.debugger.sendCommand({ tabId }, 'Network.continueRequest', { requestId: request.requestId })
    }
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
