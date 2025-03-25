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
import { HeaderPage } from '../header/header-page'

export const LogPage = createComponent(null, () => {
  const tableStore = useTableStore('log')
  const { list, filteredList, isCurrentDomain, currentDomain } = useLogsStore()

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
      <HeaderPage />
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
