import FetchInterceptor from '@/share/fetch'
import { getMockRules } from '@/share/inject-help'
import { proxy } from 'ajax-hook'
import Url from 'url-parse'

async function mockCore(url: string) {
   const currentProject = getMockRules()
   if (!currentProject) {
    throw new Error('没有匹配的规则')
  }
  const currentRule = currentProject.find((item) => {
    return url === item.url && item.active
  })
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

function convertHeadersToObject(
  headers: Headers | any,
): Record<string, string> {
  if (!headers)
    return {}

  // 如果已经是普通对象，直接返回
  if (typeof headers !== 'object' || headers.constructor === Object)
    return headers

  // 如果是 Headers 对象，转换为普通对象
  const headersObj: Record<string, string> = {}
  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      headersObj[key] = value
    })
    return headersObj
  }

  // 尝试将类似 Headers 的对象转换为普通对象
  try {
    const entries = headers.entries?.()
    if (entries) {
      for (const [key, value] of entries) {
        headersObj[key] = value
      }
      return headersObj
    }
  }
  catch (e) {
    // 忽略错误，继续尝试其他方法
  }

  // 最后尝试将对象转为普通对象
  return Object.fromEntries(Object.entries(headers))
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
    headers: convertHeadersToObject(res?.headers),
    response: res?.response || '',
  }
  const payload = {
    request,
    response: {
      status: result.status,
      headers: result.headers,
      url: config.url,
      responseTxt: result.response,
      isMock: true,
      rulePath: request.path,
    },
  }

  return { result, payload }
}

export default defineUnlistedScript(() => {
  // 监听来自 content script 的 mock 规则
  window.addEventListener('mock-rules-message', (event: Event) => {
    const message = event as CustomEvent
    if (message.detail.type === 'setMockRules') {
      window.__MOCK_RULES__ = message.detail.rules
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
        const res = await mockCore(url.href)
        const { result, payload } = handMockResult({ res, request, config })
        websiteMessenger.sendMessage('mock-rules-message', {
          ...payload,
          isMock: true,
        })

        handler.resolve(result)
      }
      catch (error) {
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
        const res = await mockCore(url.href)
        const request = {
          url: url.href,
          method: config.method,
          headers: convertHeadersToObject(config.headers),
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
            headers: convertHeadersToObject(config.headers),
            type: 'xhr',
          },
          response: {
            status,
            statusText,
            url: config.url,
            headers: convertHeadersToObject(headers),
            responseTxt: res,
            isMock: false,
            rulePath: '',
          },
        }
        websiteMessenger.sendMessage('mock-rules-message', {
          ...payload,
          isMock: false,
        })

        handler.resolve(response)
      }
    },
  })
  if (window.fetch !== undefined) {
    FetchInterceptor.register({
      async onBeforeRequest(request: Request) {
        try {
          const res = await mockCore(request.url)
           // 如果没有匹配的规则，直接返回 undefined，继续原始请求
          if (!res)
            return

          const { path: rulePath, response: mockResponse, status = 200 } = res

          let responseBody: string | Blob
          const responseInit: ResponseInit = {
            status,
            headers: { 'Content-Type': 'application/json' },
          }

          if (typeof mockResponse === 'string') {
            responseBody = mockResponse
          }
          else if (typeof mockResponse === 'object') {
            responseBody = JSON.stringify(mockResponse)
          }
          else {
            responseBody = ''
          }

          const response = new Response(responseBody, responseInit)
          // 使用 defineProperty 添加自定义属性，这样不会修改 Response 原型
          Object.defineProperty(response, 'rulePath', { value: rulePath })
          Object.defineProperty(response, 'isMock', { value: true })

          websiteMessenger.sendMessage('mock-rules-message', {
            isMock: true,
            request: {
              url: request.url,
              method: request.method,
              headers: convertHeadersToObject(request.headers),
              type: 'fetch',
            },
            response: {
              status,
              url: request.url,
              headers: convertHeadersToObject(response.headers),
              responseTxt: typeof mockResponse === 'object' ? JSON.stringify(mockResponse) : mockResponse,
              isMock: true,
              rulePath,
            },
          })

          return response
        }
        catch (err) {
          // 出错时继续原始请求
          return undefined
        }
      },
      onRequestSuccess(response: Response, request: Request) {
        const payload = {
          request: {
            type: 'fetch',
            method: request.method,
            url: request.url,
            headers: convertHeadersToObject(request.headers),
          },
          response: {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            headers: convertHeadersToObject(response.headers),
            responseTxt: '',
            isMock: !!(response as any).isMock,
            rulePath: (response as any).rulePath || '',
          },
        }

        // 检查是否是 mock 响应
        if ((response as any).isMock) {
          response.clone().json().then((res: any) => {
            const result = {
              status: response.status,
              url: request.url,
              headers: convertHeadersToObject(response.headers),
              responseTxt: typeof res === 'object' ? JSON.stringify(res) : res,
              isMock: true,
              rulePath: (response as any).rulePath,
              statusText: response.statusText,
            }
            payload.response = result
            websiteMessenger.sendMessage('mock-rules-message', {
              ...payload,
              isMock: true,
            })
          }).catch(() => {
            // 如果JSON解析失败，尝试获取文本内容
            return response.clone().text().then((textContent) => {
              const result = {
                status: response.status,
                url: request.url,
                headers: convertHeadersToObject(response.headers),
                responseTxt: textContent,
                isMock: true,
                rulePath: (response as any).rulePath,
                statusText: response.statusText,
              }
              payload.response = result
              websiteMessenger.sendMessage('mock-rules-message', {
                ...payload,
                isMock: true,
              })
            })
          })
        }
        else {
          const cloneRes = response.clone()
          // 安全地处理响应内容，先检查内容类型
          const contentType = response.headers.get('content-type') || ''

          if (contentType.includes('application/json')) {
            // 只有当内容类型是 JSON 时才尝试解析为 JSON
            cloneRes.json()
              .then((res: any) => {
                const result = {
                  status: response.status,
                  url: request.url,
                  headers: convertHeadersToObject(response.headers),
                  responseTxt: JSON.stringify(res),
                  isMock: false,
                  rulePath: '',
                  statusText: response.statusText,
                }
                payload.response = result
                websiteMessenger.sendMessage('mock-rules-message', {
                  ...payload,
                  isMock: false,
                })
              })
              .catch(() => {
                // JSON 解析失败时，尝试获取文本内容
                return cloneRes.clone().text()
              })
              .then((textContent: any) => {
                if (textContent) {
                  const result = {
                    status: response.status,
                    url: request.url,
                    headers: convertHeadersToObject(response.headers),
                    responseTxt: textContent,
                    isMock: false,
                    rulePath: '',
                    statusText: response.statusText,
                  }
                  payload.response = result
                  websiteMessenger.sendMessage('mock-rules-message', {
                    ...payload,
                    isMock: false,
                  })
                }
              })
              .catch((error) => {
                console.error('Failed to process response:', error)
              })
          }
          else {
            // 非 JSON 内容直接获取文本
            cloneRes.text()
              .then((textContent) => {
                const result = {
                  status: response.status,
                  url: request.url,
                  headers: convertHeadersToObject(response.headers),
                  responseTxt: textContent,
                  isMock: false,
                  rulePath: '',
                  statusText: response.statusText,
                }
                payload.response = result
                websiteMessenger.sendMessage('mock-rules-message', {
                  ...payload,
                  isMock: false,
                })
              })
              .catch((error) => {
                console.error('Failed to get text content:', error)
              })
          }
        }
      },
      onRequestFailure(error: any, request: Request) {
        // 处理请求失败的情况
        const response = error
        if (error instanceof Response) {
          const payload = {
            request: {
              type: 'fetch',
              method: request.method,
              url: request.url,
              headers: convertHeadersToObject(request.headers),
            },
            response: {
              status: error.status,
              statusText: error.statusText,
              url: error.url,
              headers: convertHeadersToObject(error.headers),
              responseTxt: '',
              isMock: false,
              rulePath: '',
            },
          }

          websiteMessenger.sendMessage('mock-rules-message', {
            ...payload,
            isMock: false,
          })
        }
 else {
          // 处理非Response类型的错误
          const payload = {
            request: {
              type: 'fetch',
              method: request.method,
              url: request.url,
              headers: convertHeadersToObject(request.headers),
            },
            response: {
              status: 0,
              statusText: error.message || 'Network Error',
              url: request.url,
              headers: {},
              responseTxt: error.toString(),
              isMock: false,
              rulePath: '',
            },
          }

          websiteMessenger.sendMessage('mock-rules-message', {
            ...payload,
            isMock: false,
          })
        }
      },
    })
  }
  // 发送就绪信号，通知 content script 注入脚本已准备好接收数据
  window.dispatchEvent(new CustomEvent('injected-script-ready'))
})
