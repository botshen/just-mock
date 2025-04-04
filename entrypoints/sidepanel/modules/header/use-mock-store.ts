import { ref } from 'vue'

const currentTabMocked = ref<boolean | undefined>(undefined)
// 总开关
const globalMocked = ref<boolean>(false)
const currentTabId = ref<number | null>(null) // 检查当前标签页是否被激活调试
async function handleChangeGlobalMocked(e: Event) {
  const target = e.target as HTMLInputElement
  const checked = target.checked
  if (checked) {
    await activateALLDebugger()
  }
  else {
    await deactivateALLDebugger()
  }
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

async function activateALLDebugger() {
  await sendMessage('activateAllDebugger', undefined)
}
async function deactivateALLDebugger() {
  await sendMessage('deactivateAllDebugger', undefined)
}
// 激活debugger
async function activateDebugger() {
  const tabId = await getCurrentTabId()
  console.log('tabId', tabId)
  if (tabId) {
    try {
      await sendMessage('activateDebugger', tabId)
    }
    catch (error) {
      console.error('激活debugger失败:', error)
    }
    finally {
      await checkCurrentTabMocked()
    }
  }
  else {
    console.error('未找到当前标签页')
  }
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
async function handleChangeCurrentTabMocked(e: Event) {
  const target = e.target as HTMLInputElement
  const checked = target.checked
  if (checked) {
    await activateDebugger()
  }
  else {
    await deactivateDebugger()
  }
  await checkCurrentTabMocked()
}
export function useMockStore() {
  return { handleChangeGlobalMocked, globalMocked, currentTabMocked, handleChangeCurrentTabMocked, currentTabId, activateDebugger, deactivateDebugger, checkCurrentTabMocked, getCurrentTabId }
}
