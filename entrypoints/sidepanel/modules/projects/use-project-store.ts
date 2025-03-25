import type { LogRule } from '../store/use-logs-store'

 const ruleList = ref<LogRule[]>([])

 async function onDelete(id: string) {
  const todosRepo = getTodosRepo()
  await todosRepo.delete(id)
  ruleList.value = await todosRepo.getAll()
}

export function useProjectStore() {
  return {
    ruleList,
    onDelete,
  }
}
