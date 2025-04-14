import type { LogRule } from '@/entrypoints/sidepanel/modules/store/use-logs-store'
import type { IDBPDatabase } from 'idb'
import { defineProxyService, flattenPromise } from '@webext-core/proxy-service'

// 添加重定向规则的类型定义
export interface RerouteRule {
  id: string
  actionType: 'REROUTE' | 'REPLAY'
  comment: string
  enabled: boolean
  rerouteUrl?: string
  url: string
  urlType: 'REGEX' | 'PLAIN'
}

export const [registerTodosRepo, getTodosRepo] = defineProxyService('TodosRepo', createTodosRepo)
export const [registerRerouteRepo, getRerouteRepo] = defineProxyService('RerouteRepo', createRerouteRepo)

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

function createRerouteRepo(idbPromise: Promise<IDBPDatabase>) {
  const idb = flattenPromise(idbPromise)

  return {
    async create(rule: Omit<RerouteRule, 'id'>): Promise<void> {
      await idb.add('reroutes', rule)
    },
    getOne(id: string): Promise<RerouteRule> {
      return idb.get('reroutes', id)
    },
    getAll(): Promise<RerouteRule[]> {
      return idb.getAll('reroutes')
    },
    async update(rule: RerouteRule): Promise<void> {
      const { id, actionType, comment, enabled, rerouteUrl, url, urlType } = rule
      const updateData = {
        id,
        actionType,
        comment,
        enabled,
        rerouteUrl,
        url,
        urlType,
      }
      await idb.put('reroutes', updateData)
    },
    async delete(id: string): Promise<void> {
      await idb.delete('reroutes', id)
    },
    async clear(): Promise<void> {
      await idb.clear('reroutes')
    },
  }
}
