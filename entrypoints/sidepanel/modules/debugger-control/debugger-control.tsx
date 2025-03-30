import { Button2 } from '@/components/button/button-2'
import { createComponent } from '@/share/create-component'
import { sendMessage } from '@/utils/messaging'

export const DebuggerControl = createComponent(null, () => {
  const { t } = i18n

  const currentTabId = ref<number | null>(null)

  // 获取当前标签页ID
  const getCurrentTabId = async () => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    if (tabs.length > 0 && tabs[0].id) {
      currentTabId.value = tabs[0].id
    }
    return currentTabId.value
  }

  // 激活debugger
  const activateDebugger = async () => {
    const tabId = await getCurrentTabId()
    console.log('tabId', tabId)
    if (tabId) {
      try {
        await sendMessage('activateDebugger', tabId)
        debuggerState.value.active = true
      }
      catch (error) {
        console.error('激活debugger失败:', error)
      }
    }
    else {
      console.error('未找到当前标签页')
    }
  }

  // 停用debugger
  const deactivateDebugger = async () => {
    const tabId = debuggerState.value.currentTabId
    if (tabId) {
      try {
        await sendMessage('deactivateDebugger', tabId)
        debuggerState.value.active = false
      }
      catch (error) {
        console.error('停用debugger失败:', error)
      }
    }
  }

  // 切换debugger状态
  const toggleDebugger = async () => {
    if (debuggerState.value.active) {
      await deactivateDebugger()
    }
    else {
      await activateDebugger()
    }
  }

  // 组件挂载时获取当前标签页
  onMounted(async () => {
    await activateDebugger()
  })

  // 监听标签页变化
  browser.tabs.onActivated.addListener(async (activeInfo) => {
    debuggerState.value.currentTabId = activeInfo.tabId
    // 重置debugger状态
    debuggerState.value.active = false
  })
  onMounted(() => {
    console.log('debuggerState', debuggerState.value)
  })
  return () => (
    <div class="mb-6">
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">

        <div class="flex gap-2">
          <Button2
            onClick={activateDebugger}
            class="rounded-md text-white font-medium text-sm transition-colors bg-blue-500 hover:bg-blue-600"
          >
            {t('activateDebugger') || '激活Debugger'}
          </Button2>
          <Button2
            onClick={deactivateDebugger}
            class="rounded-md text-white font-medium text-sm transition-colors bg-red-500 hover:bg-red-600"
          >
            {t('deactivateDebugger') || '停用Debugger'}
          </Button2>
        </div>
      </div>
    </div>
  )
})
