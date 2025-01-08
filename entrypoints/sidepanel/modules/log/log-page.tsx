import { Button2 } from '@/components/button/button'
import { Form, FormItem } from '@/components/form/form'
import { CreateTable } from '@/components/table/create-table'
import { useTableStore } from '@/components/table/use-table-store'
import { useLogsStore } from '@/entrypoints/sidepanel/modules/store/use-logs-store'
import { createComponent } from '@/share/create-component'
import { FilterOutline, RemoveOutline } from '@vicons/ionicons5'
import { NFloatButton, NIcon } from 'naive-ui'
import { nanoid } from 'nanoid'
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export const LogPage = createComponent(null, () => {
  const tableStore = useTableStore('log')
  const { list, filter, debouncedFilter, filteredList } = useLogsStore()
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
    <div class="m-2">
      <Form class="space-y-2">
        <FormItem
          formItemClass="mb-2"
          type="text"
          placeholder="Filter URL"
          class="w-[256px] h-8 "
          prefix={() => (
            <NIcon>
              <FilterOutline />
            </NIcon>
          )}
          modelValue={filter.value}
          onUpdate:modelValue={e => debouncedFilter(e)}
        />
      </Form>
      <Table
        cellClass="flex items-center px-2  py-0 border-b border-[#eee] text-sm  "
        headCellClass="bg-[#f6f6f6] border-b border-[#eee] "
        store={tableStore}
        actionsClass="flex gap-4"
        columns={[
          ['URL', row => (
            <div class="flex items-center">
              <span class="">
                {row.url}
              </span>
            </div>
          ), { width: 'auto', class: (row, rowIndex) => rowIndex % 2 === 0 ? 'bg-white' : 'bg-yellow-100 py-1 rounded text-yellow-800' }],
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
        list={filteredList.value || []}
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
