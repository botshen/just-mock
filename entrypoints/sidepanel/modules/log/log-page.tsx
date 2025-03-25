import { Button2 } from '@/components/button/button'
import { Form, FormItem } from '@/components/form/form'
import { Input } from '@/components/input/input'
import { CreateTable } from '@/components/table/create-table'
import { useTableStore } from '@/components/table/use-table-store'
import { useLogsStore } from '@/entrypoints/sidepanel/modules/store/use-logs-store'
import { createComponent } from '@/share/create-component'
import { onMessage } from '@/utils/messaging'
import { FilterOutline, RemoveOutline } from '@vicons/ionicons5'
import { NFloatButton, NIcon, NTooltip } from 'naive-ui'
import { nanoid } from 'nanoid'
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export const LogPage = createComponent(null, () => {
  const tableStore = useTableStore('log')
  const { list, filter, debouncedFilter, filteredList, isCurrentDomain, currentTabUrl, currentDomain } = useLogsStore()

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
    const sidebarHandler = (message: any) => {
      if (message.type === 'close-sidebar') {
        window.close()
      }
    }

    browser.runtime.onMessage.addListener(sidebarHandler)

    // 获取当前标签页URL
    await getCurrentTabUrl()

    // 设置标签页监听器
    setupTabListeners()
    onUnmounted(() => {
      browser.runtime.onMessage.removeListener(sidebarHandler)
      // 移除标签页监听器
      browser.tabs.onActivated.removeListener(getCurrentTabUrl)
      browser.tabs.onUpdated.removeListener(getCurrentTabUrl)
    })
  })

  const Table = CreateTable<{
    id: string
    url: string
    status: string
    mock: string
    type: string
    payload: string
    delay: string
    response: string
  }>()

  const router = useRouter()
  const { formData } = useLogsStore()
  const handleFilter = (e: Event) => {
    const target = e.target as HTMLInputElement
    isCurrentDomain.value = target.checked
  }

  // 根据当前域名过滤列表
  const domainFilteredList = computed(() => {
    if (!isCurrentDomain.value || !currentDomain.value) {
      return filteredList.value
    }

    return filteredList.value.filter((item) => {
      try {
        const itemUrl = new URL(item.url)
        return itemUrl.hostname === currentDomain.value
      }
      catch {
        return false
      }
    })
  })

  return () => (
    <div class="m-2">
      <x-header class="flex items-center justify-between gap-2 mb-2">
        <Input
          class="w-full h-8 inline-flex "
          placeholder="Filter URL"
          modelValue={filter.value}
          clearable
          onUpdate:modelValue={e => debouncedFilter(e)}
        />
        <span class="inline-flex items-center gap-2">
          {/* <span class="text-xs text-gray-500">

            {currentDomain.value}

          </span> */}
          <label class="swap swap-flip text-3xl">
            <input type="checkbox" checked={isCurrentDomain.value} onChange={e => handleFilter(e)} />
            <div class="swap-on">😈</div>
            <div class="swap-off">😇</div>
          </label>
        </span>
      </x-header>
      <Table
        cellClass="flex items-center px-2  py-2 border-b border-[#eee] text-sm  "
        headCellClass="bg-[#f6f6f6] border-b border-[#eee] text-xs "
        store={tableStore}
        actionsClass="flex gap-4"
        columns={[
          [
            'URL',
            (row) => {
              // 处理 URL 显示
              const getDisplayUrl = (url: string) => {
                if (isCurrentDomain.value) {
                  try {
                    const urlObj = new URL(url)
                    return urlObj.pathname + urlObj.search
                  }
                  catch {
                    return url
                  }
                }
                return url
              }

              return (
                <div
                  class="flex items-center cursor-pointer"
                  onClick={() => {
                    formData.value = {
                      url: row.url,
                      type: row.type,
                      payload: row.payload,
                      delay: row.delay,
                      response: row.response,
                      id: row.id,
                      status: row.status,
                      mock: row.mock,
                      active: true,
                      comments: '',
                    }
                    router.push('/log')
                  }}
                >
                  <span>{getDisplayUrl(row.url)}</span>
                </div>
              )
            },
            {
              width: 'auto',
              class: row =>
                row.mock === 'real'
                  ? 'bg-white'
                  : 'bg-yellow-100 rounded text-yellow-800',
            },
          ],
        ]}
        list={domainFilteredList.value || []}
      />
      <NFloatButton
        position="fixed"
        bottom="50px"
        right="10px"
        // @ts-expect-error
        onClick={() => {
          list.value = []
        }}
      >
        <NIcon>
          <RemoveOutline />
        </NIcon>
      </NFloatButton>
    </div>
  )
})
