import type { LogRule } from '@/entrypoints/sidepanel/modules/store/use-logs-store'
import type { RerouteRule } from '@/utils/service'
import { sendMessage } from '@/utils/messaging'
import { getRerouteRepo, getTodosRepo } from '@/utils/service'
import { totalSwitch } from '@/utils/storage'
// Debugger会话管理
interface DebuggerSession {
  tabId: number
  active: boolean
}
export async function doDebugger() {
  // 这个函数已被重构，现在只激活当前标签页
  // 具体逻辑已移到background.ts中的doDebugger消息处理
  console.log('doDebugger函数已被重构，请使用activateCurrentTab消息')
}

async function setCommand(tabId: number, command: string) {
  await browser.debugger.sendCommand({ tabId }, command, {
    patterns: [{
      urlPattern: 'http://*',
    }, {
      urlPattern: 'https://*',
    }],
  })
}
// 激活特定标签页的debugger
export async function activateDebugger(tabId: number) {
  try {
    // 检查标签页 URL
    const tab = await browser.tabs.get(tabId)
    const url = tab.url || ''

    // 过滤掉不支持的协议
    const unsupportedProtocols = ['chrome:', 'chrome-extension:', 'about:', 'edge:', 'data:', 'view-source:']
    if (unsupportedProtocols.some(protocol => url.toLowerCase().startsWith(protocol))) {
      return false
    }

    // 只支持 http 和 https 协议
    if (!url.toLowerCase().startsWith('http://') && !url.toLowerCase().startsWith('https://')) {
      return false
    }

    // 直接尝试分离可能存在的调试器
    try {
      await browser.debugger.detach({ tabId })
    }
    catch (e) {
      // 忽略错误，可能本来就没有附加的调试器
    }

    // 附加新的调试器
    await browser.debugger.attach({ tabId }, '1.3')
    await setCommand(tabId, 'Fetch.enable')

    return true
  }
  catch (error) {
    console.error(`激活调试器失败:`, error)
    return false
  }
}

// 停用特定标签页的debugger
export async function deactivateDebugger(tabId: number) {
  try {
    await browser.debugger.detach({ tabId })
    return true
  }
  catch (error) {
    return false
  }
}

// 停用所有debugger
export async function deactivateAllDebugger() {
  const targets = await browser.debugger.getTargets()
  const attachedTargets = targets.filter(target => target.attached)

  for (const target of attachedTargets) {
    if (target.tabId) {
      await deactivateDebugger(target.tabId)
    }
  }
}

// 查找匹配URL的规则
export async function findMatchingRule(url: string): Promise<LogRule | undefined> {
  const todo = getTodosRepo()
  const rules = await todo.getAll()
  return rules.find((rule) => {
    // 简单匹配URL，可以根据需要扩展为正则匹配
    return rule.active && url.includes(rule.url)
  })
}

// 查找匹配URL的reroute规则
export async function findMatchingRerouteRule(url: string): Promise<RerouteRule | undefined> {
  const rerouteRepo = getRerouteRepo()
  const rules = await rerouteRepo.getAll()

  return rules.find((rule) => {
    if (!rule.enabled)
      return false

    if (rule.urlType === 'REGEX') {
      try {
        const regex = new RegExp(rule.url)
        return regex.test(url)
      }
      catch (error) {
        console.error('Invalid regex pattern:', rule.url)
        return false
      }
    }
    else {
      // PLAIN 类型使用精确匹配
      return url === rule.url
    }
  })
}

// 处理mock响应
export async function handleMockResponse(tabId: number, requestId: string, rule: LogRule, request?: any) {
  try {
    // 如果设置了延迟，先等待指定时间
    const delayMs = Number(rule.delay)
    if (delayMs && delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }

    const responseBody = rule.response
    const encodedBody = btoa(
      Array.from(new TextEncoder().encode(responseBody))
        .map(byte => String.fromCharCode(byte))
        .join(''),
    )

    // 尝试发送 mock 数据到侧边栏，如果侧边栏关闭则忽略错误
    if (request) {
      try {
        await sendMessage('sendToSidePanel', {
          url: request.url,
          status: Number.parseInt(rule.status) || 200,
          mock: true,
          type: request.method,
          response: responseBody,
          payload: request.postData,
        })
      }
      catch (error) {
        // 侧边栏关闭时会出现此错误，这是正常的，不应该影响mock处理
        console.log('侧边栏未打开，跳过mock日志发送')
      }
    }

    // 使用Fetch.fulfillRequest返回mock数据
    await browser.debugger.sendCommand({ tabId }, 'Fetch.fulfillRequest', {
      requestId,
      responseCode: Number.parseInt(rule.status) || 200,
      responseHeaders: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Access-Control-Allow-Origin', value: '*' },
        { name: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS' },
        { name: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With, Accept' },
        { name: 'Access-Control-Allow-Credentials', value: 'true' },
        { name: 'Access-Control-Max-Age', value: '86400' },
      ],
      body: encodedBody, // 使用编码后的响应体
    })

    console.log(`成功mock请求: ${rule.url}`)
    return true
  }
  catch (error) {
    console.error(`处理mock响应失败:`, error)
    return false
  }
}

// 处理reroute响应
export async function handleRerouteResponse(tabId: number, requestId: string, rule: RerouteRule, request: { headers: Record<string, string>, url: string }) {
  const headersArray = Object.entries(request.headers).map(([name, value]) => ({
    name,
    value: String(value),
  }))

  // 处理正则替换
  let targetUrl = rule.rerouteUrl
  if (rule.urlType === 'REGEX') {
    const regex = new RegExp(rule.url)
    const matches = request.url.match(regex)
    if (matches) {
      // 使用正则替换，matches[1]对应$1，matches[2]对应$2，以此类推
      targetUrl = rule.rerouteUrl?.replace(/\$(\d+)/g, (_, index) => matches[index] || '')
    }
  }

  return browser.debugger.sendCommand({ tabId }, 'Fetch.continueRequest', {
    requestId,
    url: targetUrl,
    headers: headersArray,
  })
}

// 存储图片数据的缓存
const imageDataCache = new Map<string, { base64Data: string, contentType: string }>()

// 下载图片的辅助函数
export async function downloadImageFromResponse(tabId: number, requestId: string, url: string, contentType: string) {
  try {
    // 首先尝试从缓存中获取
    const cacheKey = `${tabId}-${requestId}`
    let imageData = imageDataCache.get(cacheKey)

    if (!imageData) {
      // 如果缓存中没有，尝试重新获取
      try {
        const response = await browser.debugger.sendCommand({ tabId }, 'Fetch.getResponseBody', {
          requestId,
        }) as { body: string, base64Encoded: boolean }

        if (response.base64Encoded) {
          imageData = {
            base64Data: response.body,
            contentType,
          }
        }
      }
      catch (error) {
        console.error('无法获取响应体，可能请求已过期:', error)
        return
      }
    }

    if (imageData) {
      const filename = getFileNameFromUrl(url, contentType)

      // 发送下载消息到 content script
      try {
        await browser.tabs.sendMessage(tabId, {
          type: 'downloadImage',
          data: {
            base64Data: `data:${imageData.contentType};base64,${imageData.base64Data}`,
            filename,
          },
        })
        console.log(`成功触发下载图片: ${filename}`)

        // 下载后从缓存中移除
        imageDataCache.delete(cacheKey)
      }
      catch (error) {
        console.error('发送下载消息失败:', error)
      }
    }
  }
  catch (error) {
    console.error('下载图片失败:', error)
  }
}

// 从 URL 获取文件名
function getFileNameFromUrl(url: string, contentType: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    let filename = pathname.split('/').pop() || 'image'

    // 如果没有扩展名，根据 content-type 添加
    if (!filename.includes('.')) {
      const ext = getExtensionFromContentType(contentType)
      filename = `${filename}.${ext}`
    }

    return filename
  }
  catch (error) {
    const ext = getExtensionFromContentType(contentType)
    return `image_${Date.now()}.${ext}`
  }
}

// 根据 content-type 获取文件扩展名
function getExtensionFromContentType(contentType: string): string {
  const typeMap: Record<string, string> = {
    'image/webp': 'webp',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
  }

  return typeMap[contentType.toLowerCase()] || 'webp'
}

// 检查是否为图片类型
function isImageContentType(contentType: string): boolean {
  return contentType.startsWith('image/')
}

// 处理调试器事件
export async function handleDebuggerEvent(debuggerId: any, method: string, params: any) {
  const { tabId } = debuggerId
  console.log('method', method, params)
  const { requestId, request, responseStatusCode, resourceType, responseHeaders } = params

  if (method === 'Fetch.requestPaused') {
    // 如果存在responseStatusCode，说明这是响应阶段
    if (responseStatusCode !== undefined) {
      let responseBody = ''
      let contentType = ''

      // 获取 content-type
      if (responseHeaders) {
        const contentTypeHeader = responseHeaders.find((h: any) =>
          h.name.toLowerCase() === 'content-type',
        )
        if (contentTypeHeader) {
          contentType = contentTypeHeader.value
        }
      }

      try {
        console.log('===========', request.url)
        console.log('Content-Type:', contentType)

        const response = await browser.debugger.sendCommand({ tabId }, 'Fetch.getResponseBody', {
          requestId,
        }) as { body: string, base64Encoded: boolean }

        // 检查是否为图片类型，如果是则提供下载选项
        if (isImageContentType(contentType)) {
          console.log(`检测到图片类型: ${contentType}`)

          // 缓存图片数据以备后续下载
          if (response.base64Encoded) {
            const cacheKey = `${tabId}-${requestId}`
            imageDataCache.set(cacheKey, {
              base64Data: response.body,
              contentType,
            })
          }

          // 发送图片信息到侧边栏，包含下载选项
          try {
            await sendMessage('sendToSidePanel', {
              url: request.url,
              status: responseStatusCode,
              mock: false,
              type: request.method,
              response: `[图片数据] ${contentType}`,
              payload: request.postData,
              isImage: true,
              contentType,
              requestId,
              tabId,
            })
          }
          catch (error) {
            console.log('侧边栏未打开，跳过图片信息发送')
          }

          // 继续处理响应
          return browser.debugger.sendCommand({ tabId }, 'Fetch.continueResponse', {
            requestId,
          })
        }

        if (response.base64Encoded) {
          // 使用浏览器内置的 atob 函数进行 base64 解码
          const base64String = response.body
          const binaryString = atob(base64String)
          // 将二进制字符串转换为文本
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          responseBody = new TextDecoder().decode(bytes)
        }
        else {
          responseBody = response.body
        }
      }
      catch (error) {
        console.error('处理响应失败', error)
        responseBody = '处理响应失败'
      }

      // 尝试发送完整信息到侧边栏，如果侧边栏关闭则忽略错误
      try {
        await sendMessage('sendToSidePanel', {
          url: request.url,
          status: responseStatusCode,
          mock: false,
          type: request.method,
          response: responseBody,
          payload: request.postData,
        })
      }
      catch (error) {
        // 侧边栏关闭时会出现此错误，这是正常的，不应该影响请求处理
        console.log('侧边栏未打开，跳过日志发送')
      }
      // 处理响应，这里可以根据需要修改响应
      return browser.debugger.sendCommand({ tabId }, 'Fetch.continueResponse', {
        requestId,

      })
    }
    // 检查是否有匹配的reroute或mock规则
    // const rerouteRule = await findMatchingRerouteRule(request.url)
    // if (rerouteRule) {
    //   return handleRerouteResponse(tabId, requestId, rerouteRule, request)
    // }

    const mockRule = await findMatchingRule(request.url)
    if (mockRule) {
      return handleMockResponse(tabId, requestId, mockRule, request)
    }

    // 请求阶段
    console.log('请求被拦截', request.url)

    // 继续请求，设置interceptResponse为true以在响应时再次触发
    return browser.debugger.sendCommand({ tabId }, 'Fetch.continueRequest', {
      requestId,
      interceptResponse: true,
    })
  }

  // 剩余的请求继续
  return browser.debugger.sendCommand({ tabId }, 'Fetch.continueRequest', {
    requestId,
  })
}

// 获取特定标签页的调试状态
export async function getDebuggerStatus(tabId: number): Promise<DebuggerSession> {
  try {
    const targets = (await browser.debugger.getTargets()).filter(e => e.tabId && (e.url.startsWith('http://') || e.url.startsWith('https://')))
    const activeTarget = targets.find(target => target.tabId === tabId && target.attached === true)
    if (!activeTarget) {
      return { tabId, active: false }
    }
    try {
      // 检查 Network 和 Fetch 是否启用
      await browser.debugger.sendCommand({ tabId }, 'Fetch.enable')
      return { tabId, active: true }
    }
    catch (error) {
      return { tabId, active: false }
    }
  }
  catch (error) {
    return { tabId, active: false }
  }
}

// 获取所有活跃的调试会话
export async function getAllDebuggerSessions(): Promise<DebuggerSession[]> {
  try {
    const targets = await browser.debugger.getTargets()
    return targets
      .filter(target => target.attached === true && target.tabId !== undefined)
      .map(target => ({
        tabId: target.tabId!,
        active: true,
      }))
  }
  catch (error) {
    console.error(`获取所有调试会话失败:`, error)
    return []
  }
}

// 获取请求的payload数据
async function getRequestPayload(tabId: number, requestId: string): Promise<string> {
  try {
    // 获取请求详情
    const requestDetails = await browser.debugger.sendCommand(
      { tabId },
      'Network.getRequestPostData',
      { requestId },
    )

    // 如果有postData，返回它
    if (requestDetails && 'postData' in requestDetails) {
      return requestDetails.postData as string
    }

    return ''
  }
  catch (error) {
    return ''
  }
}
