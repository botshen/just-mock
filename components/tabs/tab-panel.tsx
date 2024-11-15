import type { ClassName } from '@/share/typings'
import type { TabStore } from './use-tab-store'
import { required } from '@/share/create-component'
import { createComponent, type SlotFn } from '@/share/create-component'
import { mc } from '@/share/ui-helper'
import { inject } from 'vue'

interface TabPanelOptions {
  props: {
    name: string
    class?: ClassName
  }
  emits: {}
  slots: {
    default: SlotFn
  }
}
export const TabPanel = createComponent<TabPanelOptions>({
  inheritAttrs: false,
  props: {
    class: '',
    name: required,
  },
  emits: {},
}, (props, { emit, slots }) => {
  const { tabName, renderKind } = inject<TabStore>('tabStore')!
  const renderMap = {
    mount: () =>
      tabName.value === props.name
        ? <div class={mc('', props.class)}>{slots.default?.()}</div>
        : null,
    display: () => (
      <div class={mc(tabName.value === props.name ? 'block' : 'hidden', props.class)}>{slots.default?.()}</div>
    ),
  } as const
  return () => renderMap[renderKind.value]()
})
