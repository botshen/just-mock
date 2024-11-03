import { SlotFn } from '@/share/create-component'
import { h, HTMLAttributes } from 'vue'
import { createComponent } from '@/share/create-component'
import { mc, mergeClass } from '@/share/ui-helper'
import { ClassName } from '@/share/typings'
type MergeClassOptions = {
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
