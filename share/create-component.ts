import { Emits2Events, Prettify } from './typings'
import type { ComponentObjectPropsOptions, SetupContext, SlotsType, VNodeChild } from 'vue'
import { defineComponent, VNode } from 'vue'

export type SlotFn<T = unknown> = (...args: T[]) => VNode[]
/**
 * 将对象的值映射为另一个值
 */
const mapValues = <T, R>(obj: object, fn: (v: T) => R) => {
  const res: Record<string, R> = {}
  Object.entries(obj).forEach(([k, v]) => {
    res[k] = fn(v)
  })
  return res
}

export type Options2Props<T extends ComponentParams> = Prettify<
  T['props'] & Emits2Events<T['emits']>
>

export interface ComponentParams {
  /**
   * props 的默认值
   *
   * 如果没有默认值，那么你依然需要将默认值设置为 undefined，因为 Object.keys(props) 会被用到
   *
   * @example
   * ```ts
   * props: { name: '' }
   * ```
   */
  props?: object
  /**
   * 组件触发的事件列表
   * @example
   * ```ts
   * emits: ['click']
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emits?: Record<string, (...args: any[]) => void> | string[]
  slots?: Record<string, unknown>
}

interface Extra {
  /**
   * 根标签是否自动继承 attrs
   */
  inheritAttrs?: boolean
  name?: string
}

export const required = Symbol('required')

type MySetupContext<E = {}, S extends undefined | Record<string, unknown> = {}> = {
  attrs: Record<string, unknown>
  slots: S
  emit: S extends undefined ? undefined : SetupContext<E, SlotsType<Exclude<S, undefined>>>['emit']
  expose: SetupContext<E, SlotsType<Exclude<S, undefined>>>['expose']
}

type PropsWithDefaults<T> = {
  [K in keyof T]-?: T[K] | typeof required
}
/**
 * 快速创建一个组件
 *
 * 如果第一个参数为 null，则表示该组件不接受 props，也不触发任何事件
 * @param params 为空时请传入 null（不推荐使用函数重载，那会让类型变得复杂）
 * @param fn 组件的渲染函数，第一个参数为 props，第二个参数为 context {expose, emit, attrs, slots}
 * @returns
 */
export const createComponent = <T extends ComponentParams, I = unknown>(
  params: (Omit<T, 'slots' | 'props'> & { props?: PropsWithDefaults<T['props']> } & Extra) | null,
  fn: (props: Required<T['props']> & I, context: MySetupContext<Exclude<T['emits'], undefined>, T['slots']>) =>
  () => VNodeChild) => {
  checkProps(params?.props)
  type Props = Exclude<T['props'], undefined>
  type Emits = Exclude<T['emits'], undefined>
  type Slots = Exclude<T['slots'], undefined>
  const p = params?.props ? mapValues(params?.props, v => ({ default: v === required ? undefined : isArrayOrObject(v) ? () => v : v })) : {}
  return defineComponent<Props & I, Emits, string, SlotsType<Slots>>((props, extra) => {
    // @ts-expect-error 我通过下面的 props 属性保证 props 有默认值，所以不用担心
    return fn(props, extra)
  }, {
    props: p as ComponentObjectPropsOptions<Exclude<T['props'], undefined> & I> | undefined,
    emits: params ? (params.emits instanceof Array ? params.emits : Object.keys(params.emits ?? {})) : [],
    inheritAttrs: params?.inheritAttrs,
    name: params?.name,
  })
}

/**
 * 一个空函数
 */
export const fn = () => {}

/**
 * 判断 v 是否是数组或普通对象
 * @example
 * ```ts
 * isArrayOrObject([]) // true
 * isArrayOrObject({}) // true
 * isArrayOrObject(new Date()) // true
 * isArrayOrObject(()=>0) // false
 * isArrayOrObject('hi') // false
 * isArrayOrObject(true) // false
 * isArrayOrObject(undefined) // false
 * isArrayOrObject(null) // false
 * ```
 */
export const isArrayOrObject = (v: unknown) => {
  return v !== null && (Array.isArray(v) || typeof v === 'object')
}

/**
 * 检查 props
 *
 * 如果 props 的 key 以 on 开头，且 on 后面接大写字母，则可能是一个事件，应该放到 emits 中
 * @param props
 */
function checkProps(props?: object) {
  if (!props) {
    return
  }
  Object.entries(props).forEach(([key]) => {
    if (key.startsWith('on') && /[A-Z]/.test(key[2])) {
      console.warn(`${key} 可能是一个事件，你应该将其放到 emits 中，而不是 props 中。`)
    }
  })
}
