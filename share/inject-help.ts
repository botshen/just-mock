export function injectScriptToPage() {
  try {
    const script = document.createElement('script')
    script.setAttribute('type', 'module')
    script.src = browser.runtime.getURL('/injected.js')
    script.onload = function () {
      console.log('🔍 script injected')
      script.remove()
    }
    document.documentElement.appendChild(script)
    const input = document.createElement('input')
    input.setAttribute('id', 'xxxxxx')
    input.setAttribute('style', 'display:none')
    document.documentElement.appendChild(input)
  }
  catch (err) {
    console.error('err', err)
  }
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
