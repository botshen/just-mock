import type { ClassName } from '@/share/typings'
import { twJoin, twMerge } from 'tailwind-merge'

export type Key = string | number
const rules = [
  /^text-shadow-(.*)$/,
  /^grid-areas-(.*)$/,
  /^grid-in-(.*)$/,
]
function _mergeClass(_left: ClassName, _right: ClassName) {
  // @ts-expect-error 这是 JS 文件
  const leftParts = twJoin(_left).split(' ').filter(item => !item.match(/\s+/g))
  // @ts-expect-error 这是 JS 文件
  const rightParts = twJoin(_right).split(' ').filter(item => !item.match(/\s+/g))
  rules.forEach((rule: RegExp) => {
    leftParts.forEach((left, index) => {
      const matched = left.match(rule)
      if (matched) {
        const found = rightParts.find(right => right.match(rule))
        if (found)
          leftParts[index] = ''
      }
    })
  })
  return twMerge(leftParts.filter(Boolean).join(' '), rightParts.join(' '))
}
/**
 * @alias mc
 */
export function mergeClass(...classes: ClassName[]) {
  // 从后往前，使用 mergeClass两两合并
  return classes.reduceRight((prev, current) => _mergeClass(current, prev), '')
}
export const mc = mergeClass
/**
 * 创建一个缓存函数，缓存函数的返回值，
 * 注意不要在 fn 中使用 computed 和 watch，用了也会失效
 * 当 key 是第一次遇到的字符串时，缓存 fn(key) 的返回值
 * 当 key 是之前遇到过的字符串时，直接返回缓存的值，
 * @param fn
 * @returns
 */
export function createCachedFn<T extends object>(fn: (key: Key) => T) {
  const cache = new Map<Key, T>()
  const getFromCache = (f2: typeof fn, key: Key) => {
    if (cache.has(key)) {
      return cache.get(key)!
    }
    else {
      const r = f2(key)
      cache.set(key, r)
      return r
    }
  }
  return (key: Key = '__default__') => getFromCache(fn, key)
}

type X<F extends (p: string) => unknown> = F extends (p: infer P) => infer R
  ? (p?: P) => R
  : F

export const unique = <T>(arr: T[]): T[] => Array.from(new Set(arr))

export function withStopPropagation(fn: (event: Event) => void) {
  return (event: Event) => {
    event.stopPropagation()
    fn(event)
  }
}
