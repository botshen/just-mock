import clearIcon from '@/assets/clear.svg'
import filterIcon from '@/assets/filter.svg'
import filterAllIcon from '@/assets/filter-all.svg'
import { Input } from '@/components/input/input'
import { useLogsStore } from '@/entrypoints/sidepanel/modules/store/use-logs-store'
import { createComponent } from '@/share/create-component'
import { sendMessage } from '@/utils/messaging'
import { totalSwitch } from '@/utils/storage'
import { onMounted, onUnmounted } from 'vue'
import { useMockStore } from './use-mock-store'

export interface Options {
  props: {
    showClearButton?: boolean
  }
}

export const HeaderPage = createComponent<Options>({
  props: {
    showClearButton: false,
  },
}, (props) => {
  const {
    filter,
    debouncedFilter,
    isCurrentDomain,
    currentTabUrl,
    currentDomain,
    list,
  } = useLogsStore()
  const { t } = i18n
  const { checkCurrentTabMocked, globalMocked, handleChangeGlobalMocked, initializeStore } = useMockStore()
  // 获取当前标签页URL并提取域名
  const getCurrentTabUrl = async () => {
    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
      if (tabs && tabs.length > 0 && tabs[0].url) {
        currentTabUrl.value = tabs[0].url
        // 提取域名
        const url = new URL(tabs[0].url)
        currentDomain.value = url.hostname
        await checkCurrentTabMocked()
      }
    }
    catch (error) {
      console.error('获取当前标签页URL失败:', error)
    }
  }

  // 监听标签页切换事件
  const setupTabListeners = () => {
    // 监听标签页激活事件
    browser.tabs.onActivated.addListener(getCurrentTabUrl)

    // 监听标签页更新事件
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.active) {
        getCurrentTabUrl()
      }
    })
  }

  onMounted(async () => {
    // 获取当前标签页URL
    await getCurrentTabUrl()

    // 设置标签页监听器
    setupTabListeners()
    await checkCurrentTabMocked()
    initializeStore()

    onUnmounted(() => {
      // 移除标签页监听器
      browser.tabs.onActivated.removeListener(getCurrentTabUrl)
      browser.tabs.onUpdated.removeListener(getCurrentTabUrl)
    })
  })
  watch(globalMocked, async (newValue) => {
    if (newValue) {
      // 只对当前标签页注入debugger
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
      if (tabs && tabs.length > 0 && tabs[0].id) {
        await sendMessage('activateCurrentTab', tabs[0].id)
      }
    }
    else {
      await sendMessage('deactivateAllDebugger', undefined)
    }
    await totalSwitch.setValue(newValue)
  })
  const handleFilter = (e: Event) => {
    const target = e.target as HTMLInputElement
    isCurrentDomain.value = target.checked
  }

  const clearLogs = () => {
    list.value = []
  }

  return () => (
    <x-header class="flex items-center justify-between gap-2 mb-2">
      <Input
        class="w-full h-8 inline-flex "
        placeholder={t('filterPathPlaceholder')}
        modelValue={filter.value}
        clearable
        onUpdate:modelValue={e => debouncedFilter(e)}
      />
      {
        props.showClearButton && (
          <div class="tooltip tooltip-bottom" data-tip={t('globalMocked')}>
            <label class="label cursor-pointer">
              <input type="checkbox" class="toggle toggle-sm toggle-success " checked={globalMocked.value} onChange={e => handleChangeGlobalMocked(e)} />
            </label>
          </div>
        )
      }
      {
        props.showClearButton && (
          <div class="tooltip tooltip-bottom" data-tip={t('clearLog')}>
            <span
              class="cursor-pointer text-2xl hover:opacity-70"
              onClick={() => clearLogs()}
            >
              <img src={clearIcon} />
            </span>
          </div>
        )
      }
      <div class="tooltip tooltip-left flex items-center gap-2" data-tip={t('filterCurrentDomain')}>
        <span class=" inline-flex items-center  ">
          <label class="swap swap-flip text-2xl hover:opacity-70">
            <input
              type="checkbox"
              checked={isCurrentDomain.value}
              onChange={e => handleFilter(e)}
            />
            <div class="swap-on">
              <img src={filterIcon} />
            </div>
            <div class="swap-off">
              <img src={filterAllIcon} />
            </div>
          </label>
        </span>
      </div>

    </x-header>
  )
})
