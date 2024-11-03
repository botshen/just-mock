import type { createComponent, SlotFn } from '@/share/create-component'
import type { ClassName } from '@/share/typings'
import type { HTMLAttributes } from 'vue'
import { mc, mergeClass } from '@/share/ui-helper'
import { h } from 'vue'

interface MergeClassOptions {
  props: {
    tag?: string
    baseClass?: ClassName
    class?: ClassName
  }
  slots: {
    default: SlotFn
  }
}
export const MergeClass = createComponent<MergeClassOptions, HTMLAttributes>({
  inheritAttrs: false,
  props: {
    tag: 'div',
    baseClass: '',
    class: '',
  },
}, (props, { slots, attrs }) => {
  const localClass = mc('block', props.baseClass)
  return () => h(props.tag, { ...attrs, className: mergeClass(localClass, props.class) }, slots.default?.())
})
