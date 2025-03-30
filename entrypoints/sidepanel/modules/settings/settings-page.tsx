import { Button2 } from '@/components/button/button-2'
import { createComponent } from '@/share/create-component'
import { sendMessage } from '@/utils/messaging'
import { consoleLog, interceptSuccessTip, interceptSuccessToBackend } from '@/utils/storage'
import { onMounted } from 'vue'
import { useMockStore } from '../header/use-mock-store'

export const SettingsPage = createComponent(null, () => {
  const { t } = i18n
  const mockConfig = ref({
    interceptSuccessToBackend: false,
    consoleLog: false,
    interceptSuccessTip: false,
  })

  const { currentTabMocked, currentTabId, handleChangeCurrentTabMocked, checkCurrentTabMocked, getCurrentTabId } = useMockStore()

  // 停用所有debugger
  const deactivateAllDebugger = async () => {
    try {
      await sendMessage('deactivateAllDebugger', undefined)
      currentTabMocked.value = false
    }
    catch (error) {
      console.error('停用所有debugger失败:', error)
    }
  }
  // 监听标签页切换
  const setupTabChangeListener = () => {
    browser.tabs.onActivated.addListener(async (activeInfo) => {
      // 当标签页切换时，更新当前标签页ID
      currentTabId.value = activeInfo.tabId
      // 检查新标签页的调试状态
      await checkCurrentTabMocked()
      console.log('标签页切换，当前标签页状态:', currentTabMocked.value)
    })
  }

  // 监听存储变化
  interceptSuccessToBackend.watch((newValue) => {
    mockConfig.value.interceptSuccessToBackend = newValue
  })

  consoleLog.watch((newValue) => {
    mockConfig.value.consoleLog = newValue
  })

  interceptSuccessTip.watch((newValue) => {
    mockConfig.value.interceptSuccessTip = newValue
  })

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

  // 在组件挂载后获取存储的值和设置监听器
  onMounted(async () => {
    mockConfig.value.interceptSuccessToBackend = await interceptSuccessToBackend.getValue()
    mockConfig.value.consoleLog = await consoleLog.getValue()
    mockConfig.value.interceptSuccessTip = await interceptSuccessTip.getValue()

    // 获取当前标签和检查其调试状态
    await getCurrentTabId()
    await checkCurrentTabMocked()

    // 设置标签页切换监听器
    setupTabChangeListener()
  })

  return () => (
    <div class="m-2">
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">{t('currentTabMocked')}</span>
            <input type="checkbox" class="toggle" checked={currentTabMocked.value} onChange={e => handleChangeCurrentTabMocked(e)} />
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
          <div class="mt-4">
            <Button2 onClick={deactivateAllDebugger} class="w-full flex justify-center items-center bg-red-500 hover:bg-red-600 text-white">
              {t('deactivateAllDebugger')}
            </Button2>
          </div>
        </div>
      </div>
    </div>
  )
})
