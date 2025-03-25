import { Button2 } from '@/components/button/button'
import { Form, FormItem } from '@/components/form/form'
import { CreateTable } from '@/components/table/create-table'
import { useTableStore } from '@/components/table/use-table-store'
import { useLogsStore } from '@/entrypoints/sidepanel/modules/store/use-logs-store'
import { createComponent } from '@/share/create-component'
import { onMessage } from '@/utils/messaging'
import { FilterOutline, RemoveOutline } from '@vicons/ionicons5'
import { NFloatButton, NIcon, NTooltip } from 'naive-ui'
import { nanoid } from 'nanoid'
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export const LogPage = createComponent(null, () => {
  const tableStore = useTableStore('log')
  const { list, filter, debouncedFilter, filteredList } = useLogsStore()

  onMounted(() => {
    const sidebarHandler = (message: any) => {
      if (message.type === 'close-sidebar') {
        window.close()
      }
    }

    browser.runtime.onMessage.addListener(sidebarHandler)

    onUnmounted(() => {
      browser.runtime.onMessage.removeListener(sidebarHandler)
      // 确保移除 sendToSidePanel 的监听器
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
        cellClass="flex items-center px-2  py-2 border-b border-[#eee] text-sm  "
        headCellClass="bg-[#f6f6f6] border-b border-[#eee] text-xs "
        store={tableStore}
        actionsClass="flex gap-4"
        columns={[
          ['URL', row => (
            <NTooltip v-slots={{
              trigger: () => (
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
                  <span class="truncate block min-w-[260px] max-w-[400px]">
                    {row.url}
                  </span>
                </div>
              ),
            }}
            >
              <div class="text-xs min-w-[260px] break-all max-w-[400px]">
                {row.url}
              </div>
            </NTooltip>
          ), { width: 'auto', class: row => row.mock === 'real' ? 'bg-white' : 'bg-yellow-100 rounded text-yellow-800' }],

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
