import {
  getMockRules,
} from '@/share/inject-help'
import { proxy } from 'ajax-hook'
import { parse, stringify } from 'flatted'
import Url from 'url-parse'

async function mockCore(url: string, method: string) {
  const currentProject = getMockRules()
  console.log('currentProject333', currentProject)
  if (!currentProject) {
    throw new Error('没有匹配的规则')
  }
   const currentRule = currentProject.find((item) => {
     return url === item.url && item.active
  })
  console.log('currentRule===', currentRule)
  if (!currentRule?.active) {
    throw new Error('没有匹配的规则')
  }
  if (currentRule) {
     await new Promise(resolve => setTimeout(resolve, currentRule.Delay || 0))
    return {
      response: currentRule.response,
      path: currentRule.url,
      status: currentRule.status,
     }
  }
}

function sendMsg(msg: any, isMock = false) {
  const result = {
    ...msg,
    isMock,
  }
  const detail = parse(stringify(result))
  const event = new CustomEvent('xxxxx', { detail })
  window.dispatchEvent(event)
}

function handMockResult({
  res,
  request,
  config,
}: {
  res: any
  request: any
  config: any
}) {
   const result = {
    config,
    status: res?.status,
    headers: res?.headers,
    response: res?.response || '',
  }

  return { result }
}

export default defineUnlistedScript(() => {
  console.log('Injected script starting...')

  // 监听来自 content script 的 mock 规则
  window.addEventListener('mock-rules-message', (event: Event) => {
    console.log('Mock rules message received in injected script,监听来自 content script 的 mock 规则')
    const message = event as CustomEvent
    console.log('message', message)
    if (message.detail.type === 'setMockRules') {
      window.__MOCK_RULES__ = message.detail.rules
      console.log('Mock rules set in injected script:', window.__MOCK_RULES__)
    }
  })

  proxy({
    onRequest: async (config, handler) => {
      // 构建完整的 URL
      const fullUrl = new URL(config.url, window.location.origin).href
      const url = new Url(fullUrl)

      const request = {
        url: url.href,
        method: config.method,
        headers: config.headers,
        type: 'xhr',
      }
      try {
        const res = await mockCore(url.href, config.method)
         const { result } = handMockResult({ res, request, config })

        handler.resolve(result)
      }
    catch (error) {
      console.log('error', error)
      handler.next(config)
    }
  },
    onError: async (err, handler) => {
      handler.next(err)
    },
    onResponse: async (response, handler) => {
      const { statusText, status, config, headers, response: res } = response

      // 构建完整的 URL
      const fullUrl = new URL(config.url, window.location.origin).href
      const url = new Url(fullUrl)

      try {
        const res = await mockCore(url.href, config.method)
        const request = {
          url: url.href,
          method: config.method,
          headers: config.headers,
          type: 'xhr',
        }
        const { result } = handMockResult({ res, request, config })

        handler.resolve(result)
      }
    catch (error) {
      const payload = {
        request: {
          method: config.method,
          url: url.href, // 使用完整的 URL
          headers: config.headers,
          type: 'xhr',
        },
        response: {
          status,
          statusText,
          url: config.url,
          headers,
          responseTxt: res,
          isMock: false,
          rulePath: '',
        },
      }
      sendMsg(payload)
      handler.resolve(response)
    }
    },
  })

  // 发送就绪信号，通知 content script 注入脚本已准备好接收数据
  console.log('Injected script is ready, dispatching ready event')
  window.dispatchEvent(new CustomEvent('injected-script-ready'))
})
