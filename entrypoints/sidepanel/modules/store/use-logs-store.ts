import { debounce } from 'lodash-es'
import { computed } from 'vue'

// 定义类型
export interface LogRule {
  id: string
  url: string
  status: string
  mock: string
  payload: string
  type: string
  delay: string
  response: string
  comments?: string
  active: boolean
  // 新增图片相关字段
  isImage?: boolean
  contentType?: string
  requestId?: string
  tabId?: number
}

const list = ref<LogRule[]>([])
const formData = ref<LogRule>({
  id: '',
  url: '',
  status: '',
  mock: 'mock',
  payload: '',
  type: '',
  delay: '',
  response: '',
  comments: '',
  active: true,
})
const filter = ref('')
const isCurrentDomain = ref(false)
const currentTabUrl = ref('')
const currentDomain = ref('')
const filteredList = computed(() => {
  const searchText = filter.value.toLowerCase().trim()
  let filtered = list.value

  // 如果启用了当前域名过滤
  if (isCurrentDomain.value && currentDomain.value) {
    filtered = filtered.filter(item =>
      item.url.toLowerCase().includes(currentDomain.value.toLowerCase()),
    )
  }

  // 应用搜索文本过滤
  if (searchText) {
    filtered = filtered.filter(item =>
      item.url.toLowerCase().includes(searchText),
    )
  }

  return filtered
})

const debouncedFilter = debounce((value: string) => {
  filter.value = value
}, 300)

export function useLogsStore() {
  return {
    list,
    formData,
    filter,
    filteredList,
    debouncedFilter,
    isCurrentDomain,
    currentTabUrl,
    currentDomain,
  }
}
