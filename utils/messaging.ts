import { defineExtensionMessaging } from '@webext-core/messaging'

interface ProtocolMap {
  sendToSidePanel: (data: any) => void

  doDebugger: () => void
  deactivateDebugger: (tabId: number) => void
  activateAllDebugger: () => void
  deactivateAllDebugger: () => void
  getDebuggerStatus: (tabId: number) => { tabId: number, active: boolean } | null
  updateDebuggerRules: (rules: any[]) => void
  debuggerInterceptResult: (requestId: string, mockData: any) => void
  getAllDebuggerSessions: () => { tabId: number, active: boolean }[]
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>()
