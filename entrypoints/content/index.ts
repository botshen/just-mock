import { injectScriptToPage } from '@/share/inject-help'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    injectScriptToPage()
  },
})
