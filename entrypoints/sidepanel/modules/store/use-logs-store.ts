const list = ref<{
  id: string
  path: string
  status: string
  mock: string
  payload: string
  type: string
  delay: string
  response: string
}[]>([])
const formData = ref({
  url: '',
  method: '',
  payload: '',
  delay: '',
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
