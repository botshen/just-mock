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

  browser.commands.onCommand.addListener((command) => {
    if (command === 'toggle-sidebar') {
      browser.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        browser.sidePanel.open({ tabId: tab.id! })
      })
    }
    if (command === 'close-sidebar') {
      browser.runtime.sendMessage({ type: 'close-sidebar' })
    }
  })
})
