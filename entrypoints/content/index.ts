import { injectScriptToPage } from '@/share/inject-help'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    injectScriptToPage()
    window.addEventListener('mock-message', ((event: Event) => {
      const customEvent = event as CustomEvent
      browser.runtime.sendMessage(customEvent.detail)
    }) as EventListener)
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'getStorage') {
        chrome.storage.local.get(null, (result) => {
          sendResponse(result)
        })
        return true // 保持消息通道开启以进行异步响应
      }
    })
    window.addEventListener('content-script-message', (async (event: Event) => {
      const customEvent = event as CustomEvent
      const { id, data } = customEvent.detail

      if (data.type === 'getStorage') {
        const result = await new Promise((resolve) => {
          if (data.key) {
            // 获取指定的key(s)
            chrome.storage.local.get(data.key, resolve)
          }
          else {
            // 获取所有数据
            chrome.storage.local.get(null, resolve)
          }
        })

        // 发送响应回注入脚本
        window.dispatchEvent(new CustomEvent(`response-${id}`, {
          detail: {
            id,
            data: result,
          },
        }))
      }
    }) as EventListener)
  },
})
