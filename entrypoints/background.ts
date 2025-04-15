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
  // 根据匹配的正则激活对应tab的debugger
  onMessage('activateDebugger', async () => {
    // 获取所有 HTTP/HTTPS 标签页
    const tabs = await browser.tabs.query({
      url: ['http://*/*', 'https://*/*'],
    })

    // 检查是否需要激活调试器
    const rerouteRepo = getRerouteRepo()
    const reroutes = await rerouteRepo.getAll()
    const enabledRules = reroutes.filter(rule => rule.enabled)

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
    if (changeInfo.status === 'loading') {
      // 检查是否需要激活调试器
      const rerouteRepo = getRerouteRepo()
      const reroutes = await rerouteRepo.getAll()
      const currentTabUrl = await browser.tabs.get(tabId).then(tab => tab.url)
      console.log('currentTabUrl', currentTabUrl)
      // 检查是否有启用的规则
      const hasEnabledRules = reroutes.some((rule) => {
        if (!rule.enabled)
          return false
        console.log('rule.url', rule.url)
        const pattern = new RegExp(rule.url)
        return pattern.test(currentTabUrl ?? '')
      })

      if (hasEnabledRules) {
        // 启用调试器和 Fetch
        const success = await debuggerUtils.activateDebugger(tabId)
        if (success) {
          ke.add(tabId)
          Ce.add(tabId)

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
    debuggerUtils.deactivateDebugger(tabId)
  })
})
