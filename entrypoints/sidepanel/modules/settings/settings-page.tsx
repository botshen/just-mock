import { Button2 } from '@/components/button/button-2'
import { createComponent } from '@/share/create-component'
import { sendMessage } from '@/utils/messaging'
import { consoleLog, interceptSuccessTip, interceptSuccessToBackend, totalSwitch } from '@/utils/storage'
import { onMounted } from 'vue'

export const SettingsPage = createComponent(null, () => {
  const { t } = i18n
  const mockConfig = ref({
    totalSwitch: false,
    interceptSuccessToBackend: false,
    consoleLog: false,
    interceptSuccessTip: false,
  })

  const currentTabMocked = ref(false)
  const currentTabId = ref<number | null>(null)

  // 获取当前标签页ID
  const getCurrentTabId = async () => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    if (tabs.length > 0 && tabs[0].id) {
      currentTabId.value = tabs[0].id
    }
    return currentTabId.value
  }

  // 检查当前标签页是否被激活调试
  const checkCurrentTabMocked = async () => {
    const tabId = await getCurrentTabId()
    if (tabId) {
      try {
        const status = await sendMessage('getDebuggerStatus', tabId)
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

  // 激活debugger
  const activateDebugger = async () => {
    const tabId = await getCurrentTabId()
    console.log('tabId', tabId)
    if (tabId) {
      try {
        await sendMessage('activateDebugger', tabId)
        mockConfig.value.totalSwitch = true
        await checkCurrentTabMocked()
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
    const tabId = currentTabId.value
    if (tabId) {
      try {
        await sendMessage('deactivateDebugger', tabId)
        mockConfig.value.totalSwitch = false
        currentTabMocked.value = false
      }
      catch (error) {
        console.error('停用debugger失败:', error)
      }
    }
  }
  // 在组件挂载后获取存储的值
  onMounted(async () => {
    mockConfig.value.totalSwitch = await totalSwitch.getValue()
    mockConfig.value.interceptSuccessToBackend = await interceptSuccessToBackend.getValue()
    mockConfig.value.consoleLog = await consoleLog.getValue()
    mockConfig.value.interceptSuccessTip = await interceptSuccessTip.getValue()

    // 获取当前标签和检查其调试状态
    await getCurrentTabId()
    await checkCurrentTabMocked()
  })

  // 监听存储变化
  totalSwitch.watch((newValue) => {
    mockConfig.value.totalSwitch = newValue
  })

  interceptSuccessToBackend.watch((newValue) => {
    mockConfig.value.interceptSuccessToBackend = newValue
  })

  consoleLog.watch((newValue) => {
    mockConfig.value.consoleLog = newValue
  })

  interceptSuccessTip.watch((newValue) => {
    mockConfig.value.interceptSuccessTip = newValue
  })
  const handleChangeCurrentTabMocked = (e: Event) => {
    const target = e.target as HTMLInputElement
    const checked = target.checked
    currentTabMocked.value = checked
  }

  const handleRefreshCurrentTabMocked = async () => {
    await checkCurrentTabMocked()
    console.log('当前标签页状态:', currentTabMocked.value)

    // 直接从background获取最新的debuggerSessions状态
    try {
      const tabId = currentTabId.value
      if (tabId) {
        const status = await sendMessage('getDebuggerStatus', tabId)
        if (status) {
          currentTabMocked.value = status.active
          console.log('从background获取的状态:', status)
        }
      }
    }
    catch (error) {
      console.error('获取调试器状态失败:', error)
    }
  }

  const handleChangeTotalSwitch = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const checked = target.checked
    mockConfig.value.totalSwitch = checked
    await totalSwitch.setValue(checked)
    if (checked) {
      await activateDebugger()
    }
    else {
      await deactivateDebugger()
    }
  }

  const handleChangeInterceptSuccess = async () => {
    const newValue = !mockConfig.value.interceptSuccessToBackend
    mockConfig.value.interceptSuccessToBackend = newValue
    await interceptSuccessToBackend.setValue(newValue)
  }

  const handleChangeConsoleLog = async () => {
    const newValue = !mockConfig.value.consoleLog
    mockConfig.value.consoleLog = newValue
    await consoleLog.setValue(newValue)
  }

  const handleChangeInterceptSuccessTip = async () => {
    const newValue = !mockConfig.value.interceptSuccessTip
    mockConfig.value.interceptSuccessTip = newValue
    await interceptSuccessTip.setValue(newValue)
  }

  return () => (
    <div class="m-2">
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">{t('currentTabMocked')}</span>
            <Button2 onClick={() => handleRefreshCurrentTabMocked()}>{t('refresh')}</Button2>
            <input type="checkbox" class="toggle" checked={currentTabMocked.value} onChange={e => handleChangeCurrentTabMocked(e)} />
          </label>
          <label class="label cursor-pointer">
            <span class="label-text">{t('totalSwitch')}</span>
            <input type="checkbox" class="toggle" checked={mockConfig.value.totalSwitch} onChange={e => handleChangeTotalSwitch(e)} />
          </label>
          <label class="label cursor-pointer">
            <span class="label-text">{t('interceptSuccessToBackend')}</span>
            <input type="checkbox" class="toggle" checked={mockConfig.value.interceptSuccessToBackend} onChange={() => handleChangeInterceptSuccess()} />
          </label>
          <label class="label cursor-pointer">
            <span class="label-text">{t('consoleLog')}</span>
            <input type="checkbox" class="toggle" checked={mockConfig.value.consoleLog} onChange={() => handleChangeConsoleLog()} />
          </label>
          <label class="label cursor-pointer">
            <span class="label-text">{t('interceptSuccessTip')}</span>
            <input type="checkbox" class="toggle" checked={mockConfig.value.interceptSuccessTip} onChange={() => handleChangeInterceptSuccessTip()} />
          </label>
        </div>
      </div>
    </div>
  )
})
