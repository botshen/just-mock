import { proxy } from 'ajax-hook'

export default defineUnlistedScript(() => {
  console.log('Ajax hook script injected!')

  proxy({
    onRequest: async (config, handler) => {
      console.log('Request intercepted:', config)
      handler.next(config)
    },
    onError: async (err, handler) => {
      console.log('Request error:', err)
      handler.next(err)
    },
    onResponse: async (response, handler) => {
      console.log('Response intercepted:', response)
      handler.resolve(response)
    },
  })
})
