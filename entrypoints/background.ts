import iconPlay from '@/assets/icon.png'
import iconPause from '@/assets/icon-gray.png'
import * as debuggerUtils from '@/utils/debugger'
import { onMessage } from '@/utils/messaging'
import { getRerouteRepo, registerRerouteRepo, registerTodosRepo } from '@/utils/service'
import { totalSwitch } from '@/utils/storage'
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

  browser.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(error => console.error(error))

  onMessage('doDebugger', async () => {
    await setPauseState(false)

    // 检查全局开关
    if (!await totalSwitch.getValue()) {
      await debuggerUtils.deactivateAllDebugger()
      await setPauseState(true)
      return
    }

    // 获取当前活跃标签页
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    })

    if (tabs && tabs.length > 0 && tabs[0].id && tabs[0].url) {
      const tab = tabs[0]
      const tabId = tab.id!
      const tabUrl = tab.url!
      if (tabUrl.startsWith('http://') || tabUrl.startsWith('https://')) {
        // 先停用所有debugger，然后只激活当前标签页
        await debuggerUtils.deactivateAllDebugger()
        await debuggerUtils.activateDebugger(tabId)
        console.log(`doDebugger: 激活当前标签页 ${tabId} 的debugger`)
      }
      else {
        await debuggerUtils.deactivateAllDebugger()
        await setPauseState(true)
      }
    }
    else {
      await debuggerUtils.deactivateAllDebugger()
      await setPauseState(true)
    }
  })
  // 与上文相同

  // 只激活当前标签页的debugger
  onMessage('activateCurrentTab', async (message) => {
    const tabId = message.data as number
    await setPauseState(false)

    // 先停用所有debugger
    await debuggerUtils.deactivateAllDebugger()

    // 检查全局开关
    if (!await totalSwitch.getValue()) {
      await setPauseState(true)
      return
    }

    // 只激活当前标签页
    try {
      const tab = await browser.tabs.get(tabId)
      if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
        await debuggerUtils.activateDebugger(tabId)
        console.log(`成功激活当前标签页 ${tabId} 的debugger`)
      }
    }
    catch (error) {
      console.error(`激活当前标签页 ${tabId} 的debugger失败:`, error)
      await setPauseState(true)
    }
  })

  // 停用所有debugger
  onMessage('deactivateAllDebugger', async () => {
    await debuggerUtils.deactivateAllDebugger()
    await setPauseState(true)
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

  // 与上文相同

  async function se(e: { text: string }) {
    return new Promise<void>(t => chrome.action.setBadgeText(e, t))
  }
  async function oe(e: { color: string }) {
    return new Promise<void>(t => chrome.action.setBadgeBackgroundColor(e, t))
  }

  // 设置图标暂停状态
  async function setPauseState(isPaused: boolean) {
    await Promise.all([
      se({ text: isPaused ? '❚❚' : '' }), // 设置徽章文字
      oe({ color: isPaused ? '#666666' : '#1aa179' }), // 设置徽章背景色
    ])
  }

  // 监听标签页激活事件，当用户切换标签页时自动激活新标签页的debugger
  browser.tabs.onActivated.addListener(async (activeInfo) => {
    // 检查全局开关
    if (!await totalSwitch.getValue()) {
      await setPauseState(true)
      return
    }

    const tabId = activeInfo.tabId
    try {
      const tab = await browser.tabs.get(tabId)
      if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
        // 先停用所有debugger，然后只激活当前标签页
        await debuggerUtils.deactivateAllDebugger()
        await debuggerUtils.activateDebugger(tabId)
        await setPauseState(false)
        console.log(`标签页切换，激活标签页 ${tabId} 的debugger`)
      }
    }
    catch (error) {
      console.error(`标签页切换时激活debugger失败:`, error)
    }
  })

  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // 只在页面完成加载且是当前活跃标签页时处理
    if (changeInfo.status !== 'complete' || !tab.active || !tab.url || !/^https?:\/\//.test(tab.url))
      return

    // 检查全局开关
    if (!await totalSwitch.getValue()) {
      await setPauseState(true)
      return
    }

    // 页面加载完成时，重新激活当前标签页的debugger
    try {
      await debuggerUtils.deactivateAllDebugger()
      await debuggerUtils.activateDebugger(tabId)
      await setPauseState(false)
      console.log(`页面加载完成，重新激活标签页 ${tabId} 的debugger`)
    }
    catch (error) {
      console.error(`页面加载完成时激活debugger失败:`, error)
    }
  })

  // 监听标签页关闭事件，清理相关资源
  browser.tabs.onRemoved.addListener((tabId) => {
    debuggerUtils.deactivateDebugger(tabId)
  })
})
