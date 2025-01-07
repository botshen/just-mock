import { removeKeyFromObject, sendMessageToContentScript } from '@/share/inject-help'
import { proxy } from 'ajax-hook'
import { method } from 'lodash-es'

export default defineUnlistedScript(() => {
  proxy({
    onRequest: async (config, handler) => {
      // sendMessageToContentScript({
      //   type: 'request',
      //   isMock: false,
      //   ...removeKeyFromObject(config, 'xhr'),
      // }, 'mock-message')
      handler.next(config)
    },
    onError: async (err, handler) => {
      handler.next(err)
    },
    onResponse: async (response, handler) => {
      sendMessageToContentScript({
        type: 'response',
        status: response.status,
        response: response.response,
        headers: response.headers,
        body: response.config.body,
        url: response.config.url,
        method: response.config.method,
        statusText: response.statusText,
        isMock: false,
      }, 'mock-message')
      handler.resolve(response)
    },
  })
})
