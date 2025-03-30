import type { LogRule } from '@/entrypoints/sidepanel/modules/store/use-logs-store'
import * as debuggerUtils from '@/utils/debugger'
import { onMessage, sendMessage } from '@/utils/messaging'
import { getTodosRepo, registerTodosRepo } from '@/utils/service'
import { openDB } from 'idb'

export default defineBackground(() => {
  const db = openDB('todos', 1, {
    upgrade(db) {
      // 创建一个名为 'todos' 的对象存储
      if (!db.objectStoreNames.contains('todos')) {
        db.createObjectStore('todos', {
          keyPath: 'id',
        })
      }
    },
  })
  registerTodosRepo(db)

  // 初始化时获取所有mock规则
  const initMockRules = async () => {
    const todo = getTodosRepo()
    const rules = await todo.getAll()
   }
  initMockRules()

  browser.action.onClicked.addListener((tab) => {
    // 打开侧边栏
    browser.sidePanel.open({ windowId: tab.windowId })
  })

  // 激活特定标签页的debugger
  onMessage('activateDebugger', async (message) => {
     if (typeof message.data === 'number') {
      await debuggerUtils.activateDebugger(message.data)
    }
  })

  // 停用特定标签页的debugger
  onMessage('deactivateDebugger', async (message) => {
    console.log('message定标签页的deb', message)
    if (typeof message.data === 'number') {
      await debuggerUtils.deactivateDebugger(message.data)
    }
  })

  // 更新debugger规则
  onMessage('updateDebuggerRules', async (message) => {
    if (Array.isArray(message)) {
      debuggerUtils.updateMockRules(message as LogRule[])
    }
  })

  // 监听调试器事件
  browser.debugger.onEvent.addListener((debuggeeId, method, params) => {
    debuggerUtils.handleDebuggerEvent(debuggeeId, method, params)
  })

  // 监听标签页关闭事件，清理相关的debugger会话
  browser.tabs.onRemoved.addListener((tabId) => {
    debuggerUtils.cleanupDebuggerSession(tabId)
  })
})
