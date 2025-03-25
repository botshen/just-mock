import { defineExtensionMessaging } from '@webext-core/messaging'

interface ProtocolMap {
  sendMockRules: (data: any) => void
  sendToContentScript: (data: any) => void
  sendToSidePanel: (data: any) => void
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
