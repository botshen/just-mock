export function injectScriptToPage(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const script = document.createElement('script')
      script.setAttribute('type', 'module')
      script.src = browser.runtime.getURL('/injected.js')

      // 创建一个监听器，等待注入脚本准备就绪的事件
      const readyListener = () => {
        console.log('Injected script is ready')
        window.removeEventListener('injected-script-ready', readyListener)
        resolve()
      }
      window.addEventListener('injected-script-ready', readyListener)

      script.onload = function () {
        // 脚本加载完成，但不一定执行完毕
        // 实际的准备就绪信号将由 injected-script-ready 事件提供
        script.remove()
      }

      document.documentElement.appendChild(script)
    }
    catch (err) {
      console.error('Error injecting script:', err)
      // 即使出错也要解析 Promise，以避免阻塞后续操作
      resolve()
    }
  })
}

// 声明全局变量类型
declare global {
  interface Window {
    __MOCK_RULES__: any[]
  }
}

// 读取 mock 规则
export function getMockRules(): any[] {
  return window.__MOCK_RULES__ || []
}

// 更新 mock 规则
export function setMockRules(rules: any[]) {
  window.__MOCK_RULES__ = rules
}

export function sendMessageToContentScript<T>(message: T, eventName: string) {
  const event = new CustomEvent(eventName, { detail: message })
  window.dispatchEvent(event)
}

export function removeKeyFromObject<T>(obj: T, key: keyof T): Omit<T, keyof T> {
  const newObj = { ...obj }
  delete newObj[key]
  return newObj
}

export function tryParseJson<T>(data: string, defaultValue: T) {
  try {
    return JSON.parse(data) as T
  }
  catch (e) {
    return defaultValue
  }
}

export function sendMessageToContentScript2<T, R = any>(
  message: T,
  callback?: (response: R) => void,
) {
  const messageId = Math.random().toString(36).substring(7)

  const eventDetail = {
    id: messageId,
    data: message,
  }

  if (callback) {
    const responseHandler = (event: CustomEvent<{ id: string, data: R }>) => {
      if (event.detail.id === messageId) {
        callback(event.detail.data)
        window.removeEventListener(`response-${messageId}`, responseHandler as EventListener)
      }
    }
    window.addEventListener(`response-${messageId}`, responseHandler as EventListener)
  }

  const event = new CustomEvent('content-script-message', { detail: eventDetail })
  window.dispatchEvent(event)
}

// 修改 sendMockRulesToInjectedScript 函数，直接发送数据而不是添加事件监听器
export function sendMockRulesToInjectedScript(rules: any[]) {
  console.log('Sending mock rules to injected script:', rules)
  const event = new CustomEvent('mock-rules-message', {
    detail: { type: 'setMockRules', rules },
  })
  window.dispatchEvent(event)
}
