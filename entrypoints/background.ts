export default defineBackground(() => {
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
