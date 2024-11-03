import closeImgUrl from '@/assets/close.svg'
import { Button2 } from '@/components/button/button'
import { CreateTable } from '@/components/table/create-table'
import { useTableStore } from '@/components/table/use-table-store'
import { createComponent } from '@/share/create-component'

export const LogPage = createComponent(null, () => {
  const tableStore = useTableStore('log')

  const Table = CreateTable()
  const list = ref([
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
    {
      path: '/bapi/biz/data/space/page',
      status: '200',
      mock: '1',
      type: 'xhr',
    },
  ])

  // 添加 dialog ref
  const dialogRef = ref<HTMLDialogElement>()

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
        </div>
      </dialog>
    </div>
  )
})
