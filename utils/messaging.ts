import { defineExtensionMessaging } from '@webext-core/messaging'

interface ProtocolMap {
  sendMockRules: (data: any) => void
  sendToContentScript: (data: any) => void
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>()
