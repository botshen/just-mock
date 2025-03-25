import { defineWindowMessaging } from '@webext-core/messaging/page'

export interface WebsiteMessengerSchema {
  'init': (data: unknown) => void
  'mock-rules-message': (data: unknown) => void
}

export const websiteMessenger = defineWindowMessaging<WebsiteMessengerSchema>({
  namespace: 'website-messenging',
})
