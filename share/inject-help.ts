import { websiteMessenger } from '@/utils/website-messenging'

export function injectScriptToPage(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const script = document.createElement('script')
      script.setAttribute('type', 'module')
      script.src = browser.runtime.getURL('/injected.js')

      // 创建一个监听器，等待注入脚本准备就绪的事件
      const readyListener = () => {
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
    __MOCK_CONFIG__: any
  }
}

// 读取 mock 规则
export function getMockRules(): any[] {
  return window.__MOCK_RULES__ || []
}
export function getMockConfig(): any {
  return window.__MOCK_CONFIG__ || {}
}

export function sendMessageToContentScript<T>(message: T, eventName: string) {
  const event = new CustomEvent(eventName, { detail: message })
  window.dispatchEvent(event)
}

export function tryParseJson<T>(data: string, defaultValue: T) {
  try {
    return JSON.parse(data) as T
  }
  catch (e) {
    return defaultValue
  }
}

// 修改 sendMockRulesToInjectedScript 函数，直接发送数据而不是添加事件监听器
export function sendMockRulesToInjectedScript(rules: any[]) {
  const event = new CustomEvent('mock-rules-message', {
    detail: { type: 'setMockRules', rules },
  })
  window.dispatchEvent(event)
}

export function sendMockConfigToInjectedScript(config: any) {
  const event = new CustomEvent('mock-config-message', {
    detail: { type: 'setMockConfig', config },
  })
  window.dispatchEvent(event)
}
