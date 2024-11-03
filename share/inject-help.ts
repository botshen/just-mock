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
