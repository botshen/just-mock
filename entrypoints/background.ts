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
    // 获取所有 HTTP/HTTPS 标签页
    const tabs = await browser.tabs.query({
      url: ['http://*/*', 'https://*/*'],
    })

    // 检查是否需要激活调试器
    const rerouteRepo = getRerouteRepo()
    const reroutes = await rerouteRepo.getAll()
    const enabledRules = reroutes.filter(rule => rule.enabled)
    if (enabledRules.length === 0) {
      await debuggerUtils.deactivateAllDebugger()
      return
    }

    // 对每个标签页检查是否需要激活调试器
    for (const tab of tabs) {
      if (!tab.id || !tab.url)
        continue

      // 检查当前标签页是否匹配任何规则
      const hasMatch = enabledRules.some((rule) => {
        try {
          const pattern = new RegExp(rule.url)
          return pattern.test(tab.url!)
        }
        catch (e) {
          console.error('Invalid regex pattern:', rule.url, e)
          return false
        }
      })

      if (hasMatch) {
        // 启用调试器和 Fetch
        await debuggerUtils.activateDebugger(tab.id)
      }
    }
  })
  onMessage('activeTabWithUrl', async (message) => {
    const url = message.data as string
    // 获取所有标签页
    const tabs = await browser.tabs.query({})

    // 遍历所有标签页，检查 URL 是否匹配
    for (const tab of tabs) {
      if (tab.url && new RegExp(url).test(tab.url)) {
        // 如果 URL 匹配，停用该标签页的 debugger
        await debuggerUtils.deactivateDebugger(tab.id!)
      }
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

  // 监控所有加载的标签页
  const ke = new Set<number>() // 已附加调试器的标签页
  const Ce = new Set<number>() // 已启用 Fetch 的标签页

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

  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // 只在页面初始加载时处理
    if (changeInfo.status !== 'loading' || !tab.url || !/^https?:\/\//.test(tab.url))
      return

    // 检查全局开关
    if (!await totalSwitch.getValue()) {
      // 如果全局开关关闭，停用调试器
      if (ke.has(tabId)) {
        await debuggerUtils.deactivateDebugger(tabId)
        ke.delete(tabId)
        Ce.delete(tabId)
      }
      await setPauseState(true)
      return
    }

    // 检查是否需要附加调试器
    const rerouteRepo = getRerouteRepo()
    const reroutes = await rerouteRepo.getAll()
    const enabledRules = reroutes.filter(rule => rule.enabled)

    // 检查当前标签页是否匹配任何规则
    const hasMatch = enabledRules.some((rule) => {
      try {
        const pattern = new RegExp(rule.url)
        return pattern.test(tab.url!)
      }
      catch (e) {
        console.error('Invalid regex pattern:', rule.url, e)
        return false
      }
    })

    // 根据匹配结果决定是否附加或分离调试器
    if (hasMatch && !ke.has(tabId)) {
      // 标签页匹配规则且调试器尚未附加，附加调试器
      try {
        const success = await debuggerUtils.activateDebugger(tabId)
        if (success) {
          ke.add(tabId)
          Ce.add(tabId)
          await setPauseState(false)
          console.log(`成功附加调试器到标签页 ${tabId}`)
        }
      }
      catch (error) {
        console.error(`附加调试器到标签页 ${tabId} 失败:`, error)
      }
    }
    else if (!hasMatch && ke.has(tabId)) {
      // 标签页不匹配任何规则但调试器已附加，分离调试器
      await debuggerUtils.deactivateDebugger(tabId)
      ke.delete(tabId)
      Ce.delete(tabId)
      console.log(`已从标签页 ${tabId} 分离调试器`)
    }
  })

  // 监听标签页关闭事件，清理相关资源
  browser.tabs.onRemoved.addListener((tabId) => {
    if (ke.has(tabId)) {
      debuggerUtils.deactivateDebugger(tabId)
      ke.delete(tabId)
      Ce.delete(tabId)
    }
  })
})
