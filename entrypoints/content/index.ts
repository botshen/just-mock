const insertUrl = browser.runtime.getURL('/injected.js')
export function injectScriptToPage() {
  try {
    const insertScript = document.createElement('script')
    insertScript.setAttribute('type', 'module')
    insertScript.src = insertUrl
    document.documentElement.appendChild(insertScript)
    const input = document.createElement('input')
    input.setAttribute('id', 'xxxxxx')
    input.setAttribute('style', 'display:none')
    document.documentElement.appendChild(input)
  }
  catch (err) {
    console.error('err', err)
  }
}
export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    injectScriptToPage()
  },
})
