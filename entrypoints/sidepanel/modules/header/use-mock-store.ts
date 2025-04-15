import { ref } from 'vue'

const currentTabMocked = ref<boolean | undefined>(undefined)
// 总开关
const globalMocked = ref<boolean>(false)
const currentTabId = ref<number | null>(null) // 检查当前标签页是否被激活调试
async function handleChangeGlobalMocked(e: Event) {
  const target = e.target as HTMLInputElement
  const checked = target.checked
  totalSwitch.setValue(checked)
  globalMocked.value = checked
}
async function checkCurrentTabMocked() {
  const tabId = await getCurrentTabId()
  if (tabId) {
    try {
      const status = await sendMessage('getDebuggerStatus', tabId)
      console.log('status', status)
      if (status) {
        currentTabMocked.value = status.active
      }
      else {
        currentTabMocked.value = false
      }
    }
    catch (error) {
      console.error('获取调试器状态失败:', error)
      currentTabMocked.value = false
    }
  }
  else {
    currentTabMocked.value = false
  }
}
// 获取当前标签页ID
async function getCurrentTabId() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  if (tabs.length > 0 && tabs[0].id) {
    currentTabId.value = tabs[0].id
  }
  return currentTabId.value
}

// 停用debugger
async function deactivateDebugger() {
  const tabId = currentTabId.value
  if (tabId) {
    try {
      await sendMessage('deactivateDebugger', tabId)
    }
    catch (error) {
      console.error('停用debugger失败:', error)
    }
    finally {
      await checkCurrentTabMocked()
    }
  }
}

// 初始化函数，从存储中读取全局状态
async function initializeStore() {
  try {
    const result = await totalSwitch.getValue()
    globalMocked.value = result
  }
  catch (error) {
    console.error('初始化存储状态失败:', error)
  }
}
export function useMockStore() {
  return { handleChangeGlobalMocked, globalMocked, currentTabMocked, currentTabId, deactivateDebugger, checkCurrentTabMocked, getCurrentTabId, initializeStore }
}
