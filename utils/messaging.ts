import { defineExtensionMessaging } from '@webext-core/messaging'

interface ProtocolMap {
  sendToSidePanel: (data: any) => void
  activateDebugger: () => void
  doDebugger: () => void
  deactivateDebugger: (tabId: number) => void
  deactivateAllDebugger: () => void
  getDebuggerStatus: (tabId: number) => { tabId: number, active: boolean } | null
  updateDebuggerRules: (rules: any[]) => void
  debuggerInterceptResult: (requestId: string, mockData: any) => void
  getAllDebuggerSessions: () => { tabId: number, active: boolean }[]
  activeTabWithUrl: (url: string) => void
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>()
