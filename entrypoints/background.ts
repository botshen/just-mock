import * as debuggerUtils from '@/utils/debugger'
import { onMessage } from '@/utils/messaging'
import { registerRerouteRepo, registerTodosRepo } from '@/utils/service'
import { openDB } from 'idb'

export default defineBackground(() => {
  const db = openDB('todos', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('todos')) {
        db.createObjectStore('todos', {
          keyPath: 'id',
        })
      }
    },
  })
  registerTodosRepo(db)

  const rerouteDb = openDB('reroutes', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('reroutes')) {
        db.createObjectStore('reroutes', { keyPath: 'id' })
      }
    },
  })
  registerRerouteRepo(rerouteDb)

  browser.action.onClicked.addListener((tab) => {
    // 打开侧边栏
    browser.sidePanel.open({ windowId: tab.windowId })
  })

  onMessage('doDebugger', async () => {
    await debuggerUtils.doDebugger()
  })

  onMessage('activateAllDebugger', async () => {
    await debuggerUtils.activateAllDebugger()
  })

  // 停用所有debugger
  onMessage('deactivateAllDebugger', async () => {
    await debuggerUtils.deactivateAllDebugger()
  })

  // 获取特定标签页的debugger状态
  onMessage('getDebuggerStatus', async (message) => {
    if (typeof message.data === 'number') {
      const tabId = message.data
      return await debuggerUtils.getDebuggerStatus(tabId)
    }
    return null
  })

  // 获取所有活跃的调试会话
  onMessage('getAllDebuggerSessions', async () => {
    return await debuggerUtils.getAllDebuggerSessions()
  })

  // 监听调试器事件
  browser.debugger.onEvent.addListener((debuggerId, method, params) => {
    debuggerUtils.handleDebuggerEvent(debuggerId, method, params)
  })

  // 监控所有加载的标签页
  const ke = new Set<number>() // 已附加调试器的标签页
  const Ce = new Set<number>() // 已启用 Fetch 的标签页
  const processedTabs = new Set<number>() // 已经处理过的标签页

  browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (!await totalSwitch.getValue()) {
      const targets = await browser.debugger.getTargets()
      const target = targets.find(target => target.tabId === tabId)
      if (target?.attached) {
        debuggerUtils.deactivateDebugger(tabId)
      }
      return
    }
    if (changeInfo.status === 'loading' && !processedTabs.has(tabId)) {
      // 检查是否需要激活调试器
      const todoRepo = getTodosRepo()
      const todos = await todoRepo.getAll()
      const rerouteRepo = getRerouteRepo()
      const reroutes = await rerouteRepo.getAll()

      // 检查是否有启用的规则
      const hasEnabledRules = reroutes.some(rule => rule.enabled)
      const hasEnabledTodos = todos.some(todo => todo.active)

      if (hasEnabledRules || hasEnabledTodos) {
        // 启用调试器和 Fetch
        const success = await debuggerUtils.activateDebugger(tabId)
        if (success) {
          ke.add(tabId)
          Ce.add(tabId)
          processedTabs.add(tabId)

          // 获取标签页信息
          const tab = await browser.tabs.get(tabId)
          // 只有当标签页是新打开的（url 从 about:blank 变为实际 URL）时才重新加载
          if (tab.active && tab.status === 'loading'
            && changeInfo.url && tab.url === 'about:blank') {
            await browser.tabs.reload(tabId)
          }
        }
      }
    }
  })

  // 监听标签页关闭事件，清理相关资源
  browser.tabs.onRemoved.addListener((tabId) => {
    ke.delete(tabId)
    Ce.delete(tabId)
    processedTabs.delete(tabId)
    debuggerUtils.deactivateDebugger(tabId)
  })
})
