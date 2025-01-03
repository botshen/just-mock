const list = ref<{
  id: string
  path: string
  status: string
  mock: string
  type: string
}[]>([])
const formData = ref({
  pathRule: '',
  method: '',
  Delay: '',
  response: '',
  code: '',
  comments: '',
})

export function useLogsStore() {
  return {
    list,
    formData,
  }
}
