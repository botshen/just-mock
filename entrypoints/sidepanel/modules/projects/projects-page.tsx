import { Button2 } from '@/components/button/button'
import { CreateTable } from '@/components/table/create-table'
import { useTableStore } from '@/components/table/use-table-store'
import { router } from '@/router/router'
import { createComponent } from '@/share/create-component'
import { getTodosRepo } from '@/utils/service'
import { useLogsStore } from '../store/use-logs-store'
import { useProjectStore } from './use-project-store'

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
    active: boolean
  }>()
  const tableStore = useTableStore('projects')
  const { ruleList, onDelete } = useProjectStore()
  const { formData } = useLogsStore()
  onMounted(async () => {
     const todosRepo = getTodosRepo()
    const all = await todosRepo.getAll()
      ruleList.value = all
  })
  return () => (
    <div class="h-full">
       <Table
         cellClass="flex items-center px-2 py-2  border-b border-[#eee] text-sm h-full "
         headCellClass="bg-[#f6f6f6] border-b border-[#eee] text-xs "
         store={tableStore}
         actionsClass="flex gap-4"
         columns={[
          [
            'URL',
            row => (
              <span>
                {row.url}
              </span>
            ),
            {
              width: 'auto',

            },
          ],
          [
            'ACTIONS',
            row => (
              <div class="flex gap-x-4 items-center ">
                <Button2
                  level="text"
                  width="fit"
                  class="  text-[#4C5578] text-sm font-bold uppercase"
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
                      active: row.active,
                      comments: '',
                    }
                    router.push('/log')
                  }}
                >
                  edit
                </Button2>
                <Button2
                  level="text"
                  width="fit"
                  class="  text-[#4C5578] text-sm font-bold uppercase"
                  onClick={() => onDelete(row.id)}
                >
                  delete
                </Button2>
              </div>
            ),
            { class: 'sticky right-0 bg-white border-l border-[#eee]' },
          ],
        ]}
         list={ruleList.value || []}
       />

    </div>
  )
})
