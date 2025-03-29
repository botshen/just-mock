import { onMessage, sendMessage } from '@/utils/messaging'
import { registerTodosRepo } from '@/utils/service'
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
  browser.action.onClicked.addListener((tab) => {
    // 打开侧边栏
    browser.sidePanel.open({ windowId: tab.windowId })
  })

  onMessage('sendMockRules', async (data) => {
    const todo = getTodosRepo()
    const allTodos = await todo.getAll()

    // 获取所有标签页
    const tabs = await browser.tabs.query({})

    // 向所有标签页的 content script 发送数据
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await sendMessage('sendRulesToContentScript', allTodos, tab.id)
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
})
