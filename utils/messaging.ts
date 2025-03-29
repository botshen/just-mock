import { defineExtensionMessaging } from '@webext-core/messaging'

interface ProtocolMap {
  sendMockRules: (data: any) => void
  sendRulesToContentScript: (data: any) => void
  sendToSidePanel: (data: any) => void
  sendMockConfig: (data: any) => void
  sendMockConfigToContentScript: (data: any) => void
  // Debugger 相关消息
  activateDebugger: (tabId: number) => void
  deactivateDebugger: (tabId: number) => void
  updateDebuggerRules: (rules: any[]) => void
  debuggerInterceptResult: (requestId: string, mockData: any) => void
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>()

// 添加一个安全发送消息到侧边栏的函数
export async function safeSendToSidePanel(data: any): Promise<void> {
  try {
    await sendMessage('sendToSidePanel', data)
  }
  catch (error) {
    // console.log('Failed to send message to side panel:', error)
  }
}
