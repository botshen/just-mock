const list = ref<{
  id: string
  path: string
  status: string
  mock: string
  type: string
}[]>([])

export function useLogsStore() {
  return {
    list,
  }
}
