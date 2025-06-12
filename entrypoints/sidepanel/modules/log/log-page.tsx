import { CreateTable } from '@/components/table/create-table'
import { useTableStore } from '@/components/table/use-table-store'
import { useLogsStore } from '@/entrypoints/sidepanel/modules/store/use-logs-store'
import { createComponent } from '@/share/create-component'
import { sendMessage } from '@/utils/messaging'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { HeaderPage } from '../header/header-page'
import { useMockStore } from '../header/use-mock-store'

export const LogPage = createComponent(null, () => {
  const tableStore = useTableStore('log')
  const { filteredList, isCurrentDomain, currentDomain } = useLogsStore()
  const { globalMocked } = useMockStore()

  const Table = CreateTable<{
    id: string
    url: string
    status: string
    mock: string
    type: string
    payload: string
    delay: string
    response: string
    isImage?: boolean
    contentType?: string
    requestId?: string
    tabId?: number
  }>()

  const router = useRouter()
  const { formData } = useLogsStore()
  const { t } = i18n

  // 下载图片函数
  const downloadImage = async (row: any) => {
    if (row.isImage && row.requestId && row.tabId && row.contentType) {
      try {
        await sendMessage('downloadImage', {
          tabId: row.tabId,
          requestId: row.requestId,
          url: row.url,
          contentType: row.contentType,
        })
        console.log('图片下载请求已发送')
      }
      catch (error) {
        console.error('下载图片失败:', error)
      }
    }
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
      <HeaderPage showClearButton={true} />
      <div class={`m-2 ${!globalMocked.value ? 'opacity-50 pointer-events-none' : ''}`}>
        <Table
          cellClass="flex items-center px-2  py-2 border-b border-[#eee] text-sm  "
          headCellClass="bg-[#f6f6f6] border-b border-[#eee] text-xs "
          store={tableStore}
          actionsClass="flex gap-4"
          columns={[
            [
              () => { return t('path') },
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
                  <div class="flex items-center justify-between w-full">
                    <div
                      class="flex items-center cursor-pointer flex-1"
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
                      {row.isImage && (
                        <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {row.contentType}
                        </span>
                      )}
                    </div>
                    {row.isImage && (
                      <button
                        class="ml-2 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadImage(row)
                        }}
                      >
                        下载
                      </button>
                    )}
                  </div>
                )
              },
              {
                width: 'auto',
              },
            ],
            [
              () => { return t('isMocked') },
              (row) => {
                return row.mock === 'real' ? t('no') : t('yes')
              },
            ],
          ]}
          list={domainFilteredList.value || []}
        />
      </div>

    </div>
  )
})
