import { createComponent } from '@/share/create-component'
import { sendMessage } from '@/utils/messaging'

export const DebuggerControl = createComponent(null, () => {
  const { t } = i18n

  // debugger状态
  const debuggerState = ref({
    active: false,
    currentTabId: null as number | null,
  })

  // 获取当前标签页ID
  const getCurrentTabId = async () => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    if (tabs.length > 0 && tabs[0].id) {
      debuggerState.value.currentTabId = tabs[0].id
    }
    return debuggerState.value.currentTabId
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
      <h2 class="text-lg font-semibold mb-3">{t('debugger') || 'Debugger控制'}</h2>

      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium">{t('debuggerStatus') || 'Debugger状态'}</span>
          <span class={`px-2 py-1 rounded-full text-xs font-medium ${debuggerState.value.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {debuggerState.value.active ? (t('active') || '已激活') : (t('inactive') || '未激活')}
          </span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">{t('currentTab') || '当前标签页'}</span>
          <span class="text-xs text-gray-500">
            {debuggerState.value.currentTabId ? `ID: ${debuggerState.value.currentTabId}` : (t('noTab') || '无标签页')}
          </span>
        </div>

        <button
          onClick={toggleDebugger}
          class={`mt-4 w-full py-2 px-4 rounded-md text-white font-medium text-sm transition-colors ${debuggerState.value.active
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-blue-500 hover:bg-blue-600'
            }`}
        >
          {debuggerState.value.active
            ? (t('deactivateDebugger') || '停用Debugger')
            : (t('activateDebugger') || '激活Debugger')}
        </button>

        <p class="mt-3 text-xs text-gray-500">
          {t('debuggerDesc') || '激活Debugger后，将使用浏览器调试API拦截匹配的网络请求并返回Mock数据'}
        </p>
      </div>
    </div>
  )
})
