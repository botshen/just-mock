import type { SlotFn } from '@/share/create-component'
import type { ClassName } from '@/share/typings'
import type { TabStore } from './use-tab-store'
import { createComponent, required } from '@/share/create-component'
import { mc } from '@/share/ui-helper'
import { inject } from 'vue'

interface TabOptions {
  props: {
    name: string
    class?: ClassName
    activeClass?: ClassName
  }
  slots: {
    default: SlotFn
  }
}
export const Tab = createComponent<TabOptions>({
  inheritAttrs: false,
  props: {
    class: '',
    name: required,
    activeClass: '',
  },
}, (props, { emit, slots }) => {
  const store = inject<TabStore>('tabStore')!
  const onClick = () => {
    store.tabName.value = props.name
  }
  return () => (
    <div
      class={mc(
        'shrink-0 grow-0',
        store.tabName.value === props.name && props.activeClass,
        props.class,
      )}
      onClick={onClick}
    >
      {slots.default?.()}
    </div>
  )
})
