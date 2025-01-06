 import { storage } from 'wxt/storage'

// 定义 ruleList 存储项
export const ruleListStorage = storage.defineItem<LogRule[]>('local:ruleList', {
  fallback: [], // 设置默认值为空数组
})

// 定义类型
export interface LogRule {
  id: string
  path: string
  status: string
  mock: string
  payload: string
  type: string
  delay: string
  response: string
  comments?: string
}

const list = ref<LogRule[]>([])
const formData = ref<LogRule>({
  id: '',
  path: '',
  status: '',
  mock: 'mock',
  payload: '',
  type: '',
  delay: '',
  response: '',
  comments: '',
})

export function useLogsStore() {
  return {
    list,
    formData,
    ruleListStorage,
  }
}
