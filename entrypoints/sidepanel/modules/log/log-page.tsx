import closeImgUrl from '@/assets/close.svg'
import { Button2 } from '@/components/button/button'
import { CreateTable } from '@/components/table/create-table'
import { useTableStore } from '@/components/table/use-table-store'
import { createComponent } from '@/share/create-component'
import VueSelect from 'vue3-select-component'

export const LogPage = createComponent(null, () => {
  const tableStore = useTableStore('log')
  const selected = ref<string>('')
  browser.runtime.onMessage.addListener(async (event) => {
    console.log('event-sidepanel', event)
    list.value.unshift({
      path: event.url,
      status: '200',
      mock: event.isMock ? 'mock' : 'real',
      type: event.type,
    })
  })
  const Table = CreateTable()
  const list = ref<{
    path: string
    status: string
    mock: string
    type: string
  }[]>([])

  // 添加 dialog ref
  const dialogRef = ref<HTMLDialogElement>()
  // 接受到background的消息 就关闭sidebar
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'close-sidebar') {
      window.close()
    }
  })
  const onCloseSidebar = () => {
    window.close()
  }

  return () => (
    <div>
      <Table
        cellClass="flex items-center px-2 py-0 border-b border-[#eee] text-sm    "
        headCellClass="bg-[#f6f6f6] border-b border-[#eee]"
        store={tableStore}
        actionsClass="flex gap-4"
        columns={[
          ['PATH', 'path', { width: 'auto' }],
          ['STATUS', 'status', { width: 'auto' }],
          ['MOCK', 'mock', { width: 'auto' }],
          ['ACTIONS', row => (
            <div class="flex gap-x-4 items-center">
              <Button2
                level="text"
                width="fit"
                class="h-8 text-[#4C5578] text-sm font-bold uppercase"
                onClick={() => {
                  dialogRef.value?.showModal()
                }}
              >
                edit
              </Button2>

            </div>
          ), { class: 'sticky right-0 bg-white border-l border-[#eee]' }],
        ]}
        list={list.value}
      />

      <dialog
        ref={dialogRef}
        class="m-0 p-0 ml-4 mt-4 bg-white shadow-lg w-full h-full"
      >
        <div class="p-4">
          <h2>edit</h2>
          <img
            src={closeImgUrl}
            alt="close"
            class="absolute top-4 right-4 cursor-pointer"
            onClick={() => dialogRef.value?.close()}
          />
          <VueSelect
            modelValue={selected.value}
            onUpdate:modelValue={value => selected.value = value}
            options={[
              { label: 'Option #1', value: 'option_1' },
              { label: 'Option #2', value: 'option_2' },
              { label: 'Option #3', value: 'option_3' },
            ]}
            placeholder="Select an option"
          />
          <Button2 onClick={onCloseSidebar}>CLOSE</Button2>
        </div>
      </dialog>
    </div>
  )
})
