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
  },
})
