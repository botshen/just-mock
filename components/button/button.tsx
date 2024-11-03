 
import { ref, computed, shallowRef, watch } from 'vue'
import { ClassName } from '@/share/typings'
import { createComponent } from '@/share/create-component'
import { mc } from '@/share/ui-helper'

export * from './button-2.tsx'

type Options = {
  props: {
    type?: 'submit' | 'button' | 'reset'
    disabled?: boolean
    class: ClassName
    autoDisable?: boolean | number
  }
  emits: ['click']
  slots: {
    prefix?: () => unknown
    default?: () => unknown
    suffix?: () => unknown
  }
}

export const Button = createComponent<Options>({
  props: {
    class: '',
    type: 'button',
    disabled: false,
    autoDisable: 500,
  },
  emits: ['click'],
}, (props, { emit, slots }) => {
  const selfDisabled = ref(false)
  const _disabled = computed(() => {
    if (props.disabled) {
      return props.disabled
    }
    if (props.autoDisable) {
      return selfDisabled.value
    }
    return props.disabled
  })
  const timer = shallowRef<number>()
  watch(() => props.disabled, () => {
    if (timer.value === undefined) return
    window.clearTimeout(timer.value)
  })
  const disableDuration = computed(() =>
    props.autoDisable === false
      ? Infinity
      : props.autoDisable === true
        ? 200
        : props.autoDisable,
  )
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
      class={mc('whitespace-nowrap', props.class)}
      onClick={handleClick}
    >

      {slots.prefix?.()}
      {slots.default?.()}
      {slots.suffix?.()}

    </button>
  )
})
