import type { ClassName } from '@/share/typings'
import { createComponent, type SlotFn } from '@/share/create-component'
import { mc } from '@/share/ui-helper'

interface TabContentOptions {
  props: {
    class?: ClassName
  }
  emits: {}
  slots: {
    default: SlotFn
  }
}
export const TabContent = createComponent<TabContentOptions>({
  inheritAttrs: false,
  props: {
    class: '',
  },
  emits: {},
}, (props, { slots }) => {
  return () => <div class={mc('flex gap-2 flex-nowrap', props.class)}>{slots.default?.()}</div>
})
