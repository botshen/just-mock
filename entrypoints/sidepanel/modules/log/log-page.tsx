import { Button2 } from '@/components/button/button'
import { CreateTable } from '@/components/table/create-table'
import { useTableStore } from '@/components/table/use-table-store'
import { useLogsStore } from '@/entrypoints/sidepanel/modules/store/use-logs-store'
import { createComponent } from '@/share/create-component'
import { nanoid } from 'nanoid'
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export const LogPage = createComponent(null, () => {
  const tableStore = useTableStore('log')
  const { list } = useLogsStore()

  // 使用 onMounted 和 onUnmounted 来管理事件监听器
  onMounted(() => {
    const messageHandler = async (event: any) => {
      console.log('event    =====', event)
      if (event.type === 'response') {
        if (!Array.isArray(list.value)) {
          list.value = []
        }

        list.value.unshift({
          id: nanoid(),
          url: event.url,
          status: event.status,
          mock: event.isMock ? 'mock' : 'real',
          type: event.method,
          payload: event.body,
          delay: event.delay,
          response: event.response,
          active: true,
        })
      }
    }

    const sidebarHandler = (message: any) => {
      if (message.type === 'close-sidebar') {
        window.close()
      }
    }

    browser.runtime.onMessage.addListener(messageHandler)
    browser.runtime.onMessage.addListener(sidebarHandler)

    // 清理函数
    onUnmounted(() => {
      browser.runtime.onMessage.removeListener(messageHandler)
      browser.runtime.onMessage.removeListener(sidebarHandler)
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
  return () => (
    <div>
      <Button2
        onClick={() => {
          list.value = []
        }}
      >
        clear
      </Button2>
      <Table
        cellClass="flex items-center px-2 py-0 border-b border-[#eee] text-sm    "
        headCellClass="bg-[#f6f6f6] border-b border-[#eee]"
        store={tableStore}
        actionsClass="flex gap-4"
        columns={[
          ['URL', 'url', { width: 'auto' }],
          ['STATUS', 'status', { width: 'auto' }],
          ['MOCK', 'mock', { width: 'auto' }],
          ['ACTIONS', row => (
            <div class="flex gap-x-4 items-center">
              <Button2
                level="text"
                width="fit"
                class="h-8 text-[#4C5578] text-sm font-bold uppercase"
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
                  router.push(`/log`)
                }}
              >
                edit
              </Button2>

            </div>
          ), { class: 'sticky right-0 bg-white border-l border-[#eee]' }],
        ]}
        list={list.value || []}
      />

    </div>
  )
})
