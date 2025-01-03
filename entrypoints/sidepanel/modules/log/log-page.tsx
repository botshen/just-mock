import closeImgUrl from '@/assets/close.svg'
import { Button2 } from '@/components/button/button'
import { openDialog } from '@/components/dialog/open-dialog'
import { CreateTable } from '@/components/table/create-table'
import { useTableStore } from '@/components/table/use-table-store'
import { useLogsStore } from '@/entrypoints/sidepanel/modules/store/use-logs-store'
import { createComponent } from '@/share/create-component'
import { nanoid } from 'nanoid'
import { useRouter } from 'vue-router'

export const LogPage = createComponent(null, () => {
  const tableStore = useTableStore('log')
  const { list } = useLogsStore()

  browser.runtime.onMessage.addListener(async (event) => {
    list.value.unshift({
      id: nanoid(),
      path: event.url,
      status: '200',
      mock: event.isMock ? 'mock' : 'real',
      type: event.type,
    })
  })
  const Table = CreateTable<{
    id: string
    path: string
    status: string
    mock: string
    type: string
  }>()

  // 接受到background的消息 就关闭sidebar
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'close-sidebar') {
      window.close()
    }
  })

  const router = useRouter()

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
          ['PATH', 'path', { width: 'auto' }],
          ['STATUS', 'status', { width: 'auto' }],
          ['MOCK', 'mock', { width: 'auto' }],
          ['ACTIONS', () => (
            <div class="flex gap-x-4 items-center">
              <Button2
                level="text"
                width="fit"
                class="h-8 text-[#4C5578] text-sm font-bold uppercase"
                onClick={() => {
                  router.push(`/log`)
                }}
              >
                edit
              </Button2>

            </div>
          ), { class: 'sticky right-0 bg-white border-l border-[#eee]' }],
        ]}
        list={list.value}
      />

    </div>
  )
})
