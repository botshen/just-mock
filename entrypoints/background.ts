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
    console.log('rules', rules)
    debuggerUtils.initMockRules(rules)
  }
  initMockRules()

  browser.action.onClicked.addListener((tab) => {
    // 打开侧边栏
    browser.sidePanel.open({ windowId: tab.windowId })
  })

  // 处理mock规则更新
  onMessage('sendMockRules', async (data) => {
    const todo = getTodosRepo()
    const rules = await todo.getAll()

    // 更新debugger模块中的规则
    debuggerUtils.updateMockRules(rules)

    // 获取所有标签页
    const tabs = await browser.tabs.query({})

    // 向所有标签页的 content script 发送数据
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await sendMessage('sendRulesToContentScript', rules, tab.id)
        }
        catch (error) {
          // console.error(`向标签页 ${tab.id} 发送消息失败:`, error)
        }
      }
    }
  })

  onMessage('sendMockConfig', async (data) => {
    // 获取所有标签页
    const tabs = await browser.tabs.query({})

    // 向所有标签页的 content script 发送数据
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await sendMessage('sendMockConfigToContentScript', data, tab.id)
        }
        catch (error) {
          // console.error(`向标签页 ${tab.id} 发送消息失败:`, error)
        }
      }
    }
  })

  // 激活特定标签页的debugger
  onMessage('activateDebugger', async (message) => {
    console.log('message', message)
    if (typeof message.data === 'number') {
      await debuggerUtils.activateDebugger(message.data)
    }
  })

  // 停用特定标签页的debugger
  onMessage('deactivateDebugger', async (message) => {
    if (typeof message === 'number') {
      await debuggerUtils.deactivateDebugger(message)
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
