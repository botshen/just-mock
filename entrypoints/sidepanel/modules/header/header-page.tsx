import { Input } from '@/components/input/input'
import { useLogsStore } from '@/entrypoints/sidepanel/modules/store/use-logs-store'
import { createComponent } from '@/share/create-component'
import { onMounted, onUnmounted } from 'vue'

export const HeaderPage = createComponent(null, () => {
   const { filter, debouncedFilter, isCurrentDomain, currentTabUrl, currentDomain } = useLogsStore()

  // 获取当前标签页URL并提取域名
  const getCurrentTabUrl = async () => {
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true })
      if (tabs && tabs.length > 0 && tabs[0].url) {
        currentTabUrl.value = tabs[0].url
        // 提取域名
        const url = new URL(tabs[0].url)
        currentDomain.value = url.hostname
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
    onUnmounted(() => {
       // 移除标签页监听器
      browser.tabs.onActivated.removeListener(getCurrentTabUrl)
      browser.tabs.onUpdated.removeListener(getCurrentTabUrl)
    })
  })

  const handleFilter = (e: Event) => {
    const target = e.target as HTMLInputElement
    isCurrentDomain.value = target.checked
  }

  return () => (
    <x-header class="flex items-center justify-between gap-2 mb-2">
    <Input
      class="w-full h-8 inline-flex "
      placeholder="Filter URL"
      modelValue={filter.value}
      clearable
      onUpdate:modelValue={e => debouncedFilter(e)}
    />
    <span class="inline-flex items-center gap-2">
      <label class="swap swap-flip text-3xl">
        <input type="checkbox" checked={isCurrentDomain.value} onChange={e => handleFilter(e)} />
        <div class="swap-on">😈</div>
        <div class="swap-off">😇</div>
      </label>
    </span>
    </x-header>
  )
})
