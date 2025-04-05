import deleteUrl from '@/assets/delete.svg'
import { Button2 } from '@/components/button/button'
import { CreateTable } from '@/components/table/create-table'
import { useTableStore } from '@/components/table/use-table-store'
import { router } from '@/router/router'
import { createComponent } from '@/share/create-component'
import { getTodosRepo } from '@/utils/service'
import { computed } from 'vue'
import { HeaderPage } from '../header/header-page'
import { useMockStore } from '../header/use-mock-store'
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
  const { globalMocked } = useMockStore()

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
  const { t } = i18n
  onMounted(async () => {
    const todosRepo = getTodosRepo()
    const all = await todosRepo.getAll()
    ruleList.value = all
  })
  return () => (
    <div class="m-2">
      <HeaderPage />
      <div class={`m-2 ${!globalMocked.value ? 'opacity-50 pointer-events-none' : ''}`}>
        <Table
          cellClass="flex items-center px-2 py-2  border-b border-[#eee] text-sm h-full "
          headCellClass="bg-[#f6f6f6] border-b border-[#eee] text-xs "
          store={tableStore}
          actionsClass="flex gap-4"
          columns={[
            [
              () => { return t('path') },
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
                  <img src={deleteUrl}></img>
                </div>
              ),
              { class: 'sticky right-0 bg-white border-l border-[#eee]' },
            ],
          ]}
          list={domainFilteredList.value || []}
        />
      </div>

    </div>
  )
})
