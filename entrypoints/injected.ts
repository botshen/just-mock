import { removeKeyFromObject, sendMessageToContentScript, sendMessageToContentScript2 } from '@/share/inject-help'
import { proxy } from 'ajax-hook'

interface StorageData {
  // 定义你需要的存储数据类型
  [key: string]: any
}

async function getStorageData<T = StorageData>(key?: string | string[]): Promise<T> {
  return new Promise((resolve) => {
    sendMessageToContentScript2({
      type: 'getStorage',
      key, // 可以是单个key、多个key数组，或不传表示获取所有数据
    }, (response: T) => {
      resolve(response)
    })
  })
}

export default defineUnlistedScript(() => {
  proxy({
    onRequest: async (config, handler) => {
      // 获取特定key的数据
      const specificData = await getStorageData<string>('ruleList')
      console.log('specificData', specificData)
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
