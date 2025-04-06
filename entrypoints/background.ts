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
  browser.webNavigation.onBeforeNavigate.addListener(async (details) => {
    // 只处理主框架的导航，忽略iframe等
    // if (details.frameId === 0) {

    // }
    debuggerUtils.shouldActivateDebugger(details.tabId)
  })

  // 监听标签页关闭事件，清理相关资源
  browser.tabs.onRemoved.addListener((tabId) => {
    debuggerUtils.deactivateDebugger(tabId).catch(err =>
      console.error(`关闭标签页 ${tabId} 时停用调试器失败:`, err),
    )
  })
})
