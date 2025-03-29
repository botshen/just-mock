import {
  getMockConfig,
  injectScriptToPage,
  sendMockConfigToInjectedScript,
  sendMockRulesToInjectedScript,
} from '@/share/inject-help'
import { onMessage, safeSendToSidePanel } from '@/utils/messaging'
import { getTodosRepo } from '@/utils/service'
import { consoleLog, interceptSuccessTip, interceptSuccessToBackend, totalSwitch } from '@/utils/storage'
import { websiteMessenger } from '@/utils/website-messenging'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main: async () => {
    // await injectScript()
  },
})

async function injectScript() {
  await injectScriptToPage()
  const todo = getTodosRepo()
  const allTodos = await todo.getAll()
  sendMockRulesToInjectedScript(allTodos)
  sendMockConfigToInjectedScript({
    totalSwitch: await totalSwitch.getValue(),
    interceptSuccessToBackend: await interceptSuccessToBackend.getValue(),
    consoleLog: await consoleLog.getValue(),
    interceptSuccessTip: await interceptSuccessTip.getValue(),
  })
  onMessage('sendRulesToContentScript', (message) => {
    sendMockRulesToInjectedScript(message.data)
  })
  onMessage('sendMockConfigToContentScript', (message) => {
    sendMockConfigToInjectedScript(message.data)
  })
  websiteMessenger.onMessage('mock-rules-message', (message: any) => {
    safeSendToSidePanel(message.data)
  })
}
