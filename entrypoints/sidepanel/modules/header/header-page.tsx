import { Input } from '@/components/input/input'
import { useLogsStore } from '@/entrypoints/sidepanel/modules/store/use-logs-store'
import { createComponent } from '@/share/create-component'
import { onMounted, onUnmounted } from 'vue'

export const HeaderPage = createComponent(null, () => {
  const { filter, debouncedFilter, isCurrentDomain, currentTabUrl, currentDomain, list } = useLogsStore()

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

  const clearLogs = () => {
     list.value = []
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
    <span class="cursor-pointer text-2xl hover:opacity-70" onClick={() => clearLogs()} title="清空日志">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
<defs>
<mask id="ipTClearFormat0">
<g fill="none" stroke="#fff">
<path fill="#555555" stroke-linejoin="round" stroke-width="4.302" d="M44.782 24.17L31.918 7.1L14.135 20.5L27.5 37l3.356-2.336z" />
<path stroke-linejoin="round" stroke-width="4.302" d="m27.5 37l-3.839 3.075l-10.563-.001l-2.6-3.45l-6.433-8.536L14.5 20.225" />
<path stroke-linecap="round" stroke-width="4.5" d="M13.206 40.072h31.36" />
</g>
</mask>
</defs>
<path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipTClearFormat0)" />
    </svg>
    </span>
    <span class="inline-flex items-center gap-2">
      <label class="swap swap-flip text-2xl hover:opacity-70">
        <input type="checkbox" checked={isCurrentDomain.value} onChange={e => handleFilter(e)} />
        <div class="swap-on"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2.57 3h18.86l-6.93 9.817V21h-5v-8.183zm3.86 2l5.07 7.183V19h1v-6.817L17.57 5zm11.952 12.351L20 18.974l1.618-1.623l1.416 1.412L20 21.806l-3.034-3.042zm-.002-.714L20 15.015l1.619 1.622l1.415-1.414L20 12.185l-3.034 3.038z" /></svg></div>
        <div class="swap-off"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" fill-rule="evenodd" d="m310.109 279.878l142.31 142.309l-30.17 30.17l-139.292-139.293l-5.623 6.874v149.334h-42.667V319.938h-.448L42.667 85.272L64 85.27l25.752-25.75zM175.841 85.271h293.493l-132.072 161.42l-30.312-30.312l72.357-88.44l-160.798-.001z" /></svg></div>
      </label>
    </span>
    </x-header>
  )
})
