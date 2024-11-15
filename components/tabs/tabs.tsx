import type { SlotFn } from '@/share/create-component'
import type { ClassName } from '@/share/typings'
import type { TabStore } from './use-tab-store'
import { createComponent, fn } from '@/share/create-component'
import { createNanoId } from '@/share/id-helper'
import { mc } from '@/share/ui-helper'
import { provide } from 'vue'
import { useTabStore } from './use-tab-store'

export * from './tab'
export * from './tab-content'
export * from './tab-nav'
export * from './tab-panel'
export * from './use-tab-store'

interface Options {
  props: {
    modelValue?: string | number | null
    class?: ClassName
    store?: TabStore | null
  }
  emits: {
    'update:modelValue': (value: string | number) => void
  }
  slots: {
    default: SlotFn
  }
}
/**
 * @example
 * ```vue
 * <Tabs v-model={x}>
 *   <template v-slot="{selected}" v-for="(item, index) in items">Tab {{index}}</template>
 * </Tabs>
 * ```
 */
export const Tabs = createComponent<Options>({
  inheritAttrs: false,
  props: {
    modelValue: null,
    class: '',
    store: null,
  },
  emits: {
    'update:modelValue': fn,
  },
}, (props, { slots }) => {
  const store = props.store ?? useTabStore(createNanoId('tab-store'))
  provide('tabStore', store)
  return () => (
    <div class={mc('block', props.class)}>
      {slots.default?.()}
    </div>
  )
})
