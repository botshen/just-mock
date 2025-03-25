import {
  injectScriptToPage,
  sendMockRulesToInjectedScript,
 } from '@/share/inject-help'
import { onMessage, safeSendToSidePanel } from '@/utils/messaging'
import { getTodosRepo } from '@/utils/service'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main: async () => {
    await injectScriptToPage()
    const todo = getTodosRepo()
    const allTodos = await todo.getAll()
    sendMockRulesToInjectedScript(allTodos)
    onMessage('sendToContentScript', (message) => {
      sendMockRulesToInjectedScript(message.data)
    })
    websiteMessenger.onMessage('mock-rules-message', (message: any) => {
       safeSendToSidePanel(message.data)
    })
  },
})
