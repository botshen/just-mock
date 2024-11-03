import { removeKeyFromObject, sendMessageToContentScript } from '@/share/inject-help'
import { proxy } from 'ajax-hook'

export default defineUnlistedScript(() => {
  proxy({
    onRequest: async (config, handler) => {
      sendMessageToContentScript({
        type: 'request',
        isMock: false,
        ...removeKeyFromObject(config, 'xhr'),
      }, 'mock-message')
      handler.next(config)
    },
    onError: async (err, handler) => {
      handler.next(err)
    },
    onResponse: async (response, handler) => {
      handler.resolve(response)
    },
  })
})
