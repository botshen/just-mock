import type { LogRule } from '@/entrypoints/sidepanel/modules/store/use-logs-store'
import type { IDBPDatabase } from 'idb'
import { defineProxyService, flattenPromise } from '@webext-core/proxy-service'

export const [registerTodosRepo, getTodosRepo] = defineProxyService('TodosRepo', createTodosRepo)

function createTodosRepo(idbPromise: Promise<IDBPDatabase>) {
  const idb = flattenPromise(idbPromise)

  return {
    async create(todo: Omit<LogRule, 'id'>): Promise<void> {
      await idb.add('todos', todo)
    },
    getOne(id: string): Promise<LogRule> {
      return idb.get('todos', id)
    },
    getAll(): Promise<LogRule[]> {
      return idb.getAll('todos')
    },
    async update(todo: LogRule): Promise<void> {
      const { id, url, status, mock, payload, type, delay, response, comments, active } = todo
      const updateData = {
        id,
        url,
        status,
        mock,
        payload,
        type,
        delay,
        response,
        comments,
        active,
      }
      console.log('updateData', updateData)
      await idb.put('todos', updateData)
    },
    async delete(url: string): Promise<void> {
      await idb.delete('todos', url)
    },
    async clear(): Promise<void> {
      await idb.clear('todos')
    },
  }
}
