 import type { LogRule } from '../store/use-logs-store'
import { Button2 } from '@/components/button/button'
import { CreateTable } from '@/components/table/create-table'
import { useTableStore } from '@/components/table/use-table-store'
import { createComponent } from '@/share/create-component'
import { getTodosRepo } from '@/utils/service'

export const ProjectsPage = createComponent(null, () => {
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
  const tableStore = useTableStore('projects')
  const ruleList = ref<LogRule[]>([])
  onMounted(async () => {
    console.log('ProjectsPage mounted')
    const todosRepo = getTodosRepo()
    ruleList.value = await todosRepo.getAll()
    console.log('ruleList', ruleList.value)
  })
  return () => (
    <div class="h-full">
     <Table
       cellClass="flex items-center px-2  py-2 border-b border-[#eee] text-sm h-full "
       headCellClass="bg-[#f6f6f6] border-b border-[#eee] text-xs "
       store={tableStore}
       actionsClass="flex gap-4"
       columns={[
          ['URL', row => (

              <span class="truncate block min-w-[260px] max-w-[400px]">
                {row.url}
              </span>

          ), { width: 'auto', class: row => row.mock === 'real' ? 'bg-white' : 'bg-yellow-100 rounded text-yellow-800' }],
           ['ACTIONS', row => (
            <div class="flex gap-x-4 items-center w-[60px]">
              <Button2
                level="text"
                width="fit"
                class="h-8 text-[#4C5578] text-sm font-bold uppercase"
                onClick={() => {
                  console.log('delete', row)
                }}
              >
                delete
              </Button2>

            </div>
          ), { class: 'sticky right-0 bg-white border-l border-[#eee]' }],
        ]}
       list={ruleList.value || []}
     />
    </div>
  )
})
