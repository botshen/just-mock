import { injectScriptToPage } from '@/share/inject-help'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    injectScriptToPage()
    window.addEventListener('mock-message', (event) => {
      console.log('event-content', event)
      browser.runtime.sendMessage(event.detail)
    })
  },
})
