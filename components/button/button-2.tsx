import type { ClassName } from '@/share/typings'
import { createComponent } from '@/share/create-component'
import { mc } from '@/share/ui-helper'
import { cva } from 'class-variance-authority'
import { computed, ref, shallowRef, watch } from 'vue'

const buttonStyles = cva(
  'text-[14px] font-bold  border border-solid rounded  flex items-center',
  {
    variants: {
      level: {
        important: 'bg-[#4f5572] text-white font-bol justify-center py-2 px-4',
        form_important: 'bg-[#4f5572] text-white font-bold py-2 px-4 ',
        form: 'bg-[#fff] text-[#4f5572] font-bold py-2 px-4 ',
        normal: 'bg-white font-bold py-2 px-4 ',
        danger: 'bg-white  text-[#E92D2D] border-none py-2 px-4',
        remove: 'bg-[#E92D2D] text-white border-none font-bold py-2 px-4',
        remove_outline: 'bg-transparent text-[#E92D2D] border-[#E92D2D] font-bold py-2 px-4',
        text: 'border-0 bg-transparent px-0',
      },
      width: {
        fit: 'w-fit',
        full: 'w-full',
      },
      disabled: {
        true: 'cursor-not-allowed !bg-[#ccc] !text-[#999] !border-[#ccc]',
        false: '',
      },
    },
    defaultVariants: {
      level: 'normal',
      disabled: false,
      width: 'fit',
    },
  },
)

interface Options {
  props: {
    level?: 'important' | 'normal' | 'danger' | 'form_important' | 'form' | 'remove' | 'remove_outline' | 'text'
    type?: 'submit' | 'button'
    disabled?: boolean
    class?: ClassName
    autoDisable?: true | number
    width?: 'fit' | 'full'
  }
  emits: ['click']
  slots: {
    prefix?: () => unknown
    default?: () => unknown
    suffix?: () => unknown
  }
}

export const Button2 = createComponent<Options>({
  props: {
    level: 'normal',
    class: '',
    type: 'button',
    disabled: false,
    autoDisable: 500,
    width: 'fit',
  },
  emits: ['click'],
}, (props, { emit, slots }) => {
  const selfDisabled = ref(false)
  const _disabled = computed(() => {
    if (props.disabled) {
      return true
    }
    if (props.autoDisable) {
      return selfDisabled.value
    }
    return props.disabled
  })
  const timer = shallowRef<number>()
  watch(() => props.disabled, () => {
    if (timer.value === undefined)
      return
    window.clearTimeout(timer.value)
  })
  const disableDuration = computed(() => props.autoDisable === true ? 200 : props.autoDisable)
  const handleClick = (e: MouseEvent) => {
    emit('click', e)
    window.setTimeout(() => {
      if (props.autoDisable) {
        selfDisabled.value = true
        timer.value = window.setTimeout(() => {
          selfDisabled.value = false
          timer.value = undefined
        }, disableDuration.value)
      }
    })
  }
  return () => (
    <button
      disabled={_disabled.value}
      type={props.type}
      class={mc('whitespace-nowrap', buttonStyles({ level: props.level, width: props.width, disabled: _disabled.value }), props.class)}
      onClick={handleClick}
    >

      {slots.prefix?.()}
      {slots.default?.()}
      {slots.suffix?.()}

    </button>
  )
})
