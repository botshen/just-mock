import type { SlotFn } from '@/share/create-component'
import type { ClassName } from '@/share/typings'

import { createComponent, fn } from '@/share/create-component'
import { mc } from '@/share/ui-helper'

interface Options {
  props: {
    type?: string
    modelValue?: string
    placeholder?: string
    class?: ClassName
    id?: string
    disabled?: boolean
  }
  emits: {
    'update:modelValue': (val: string) => void
  }
  slots: {
    prefix?: SlotFn
    suffix?: SlotFn
    default: SlotFn
  }
}

export const Input = createComponent<Options>({
  inheritAttrs: false,
  props: {
    type: 'text',
    class: '',
    modelValue: '',
    placeholder: '',
    id: '',
    disabled: false,
  },

  emits: {
    'update:modelValue': fn,
  },
}, (props, { emit, slots }) => {
  return () => (
    <div
      class={mc('rounded border border-[#cccccc] flex items-center focus-within:border-2 focus-within:border-[#4E5575]', props.class)}
    >
      {slots.prefix?.()}
      <input
        id={props.id}
        type={props.type}
        value={props.modelValue}
        placeholder={props.placeholder}
        disabled={props.disabled}
        class="text-base pl-2 w-full rounded grow flex items-center placeholder:text-left placeholder:text-[#999] placeholder:font-normal placeholder:-translate-y-px outline-none"
        onInput={(e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value)}
        onFocus={e => (e.target as HTMLElement).parentElement?.classList.add('focused')}
        onBlur={e => (e.target as HTMLElement).parentElement?.classList.remove('focused')}
      />
      {slots.suffix?.()}
    </div>
  )
})
