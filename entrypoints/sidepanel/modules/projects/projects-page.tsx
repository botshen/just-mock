import { Button2 } from '@/components/button/button'
import { CreateTable } from '@/components/table/create-table'
import { useTableStore } from '@/components/table/use-table-store'
import { router } from '@/router/router'
import { createComponent } from '@/share/create-component'
import { getTodosRepo } from '@/utils/service'
import { computed } from 'vue'
import { HeaderPage } from '../header/header-page'
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
  const { formData, isCurrentDomain, currentDomain, filter } = useLogsStore()

  const domainFilteredList = computed(() => {
    const filtered = ruleList.value.filter(item => item.url.includes(filter.value))
    if (!isCurrentDomain.value || !currentDomain.value) {
      return filtered
    }

    return filtered.filter((item) => {
      try {
        const itemUrl = new URL(item.url)
        return itemUrl.hostname === currentDomain.value
      }
      catch {
        return false
      }
    })
  })

  onMounted(async () => {
     const todosRepo = getTodosRepo()
    const all = await todosRepo.getAll()
      ruleList.value = all
  })
  return () => (
    <div class="h-full m-2">
            <HeaderPage />

       <Table
         cellClass="flex items-center px-2 py-2  border-b border-[#eee] text-sm h-full "
         headCellClass="bg-[#f6f6f6] border-b border-[#eee] text-xs "
         store={tableStore}
         actionsClass="flex gap-4"
         columns={[
          [
            'URL',
            (row) => {
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
                <span
                  class="cursor-pointer"
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
                  {getDisplayUrl(row.url)}
                </span>
              )
            },
            {
              width: 'auto',
              class: row => row.active ? 'bg-white' : 'bg-red-200  text-red-800',
            },
          ],
          [
            '',
            row => (
                <div
                  class="cursor-pointer  hover:bg-gray-100 rounded"
                  onClick={() => onDelete(row.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4C5578" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </div>

            ),
            { class: 'sticky right-0 bg-white border-l border-[#eee]' },
          ],
        ]}
         list={domainFilteredList.value || []}
       />

    </div>
  )
})
