import { createComponent, required } from '@/share/create-component'
import { mc } from '@/share/ui-helper'
import { Checkbox } from './checkbox'

interface CheckboxOption {
  label: string
  value: string
}

interface Options {
  props: {
    modelValue: string []
    options: CheckboxOption[]
    class?: string
    disabled?: boolean
  }
  emits: {
    'update:modelValue': (val: string []) => void
  }
}

export const CheckboxGroup = createComponent<Options>({
  inheritAttrs: false,
  props: {
    modelValue: required,
    options: required,
    disabled: false,
    class: '',
  },
  emits: {
    'update:modelValue': (val: (string | number)[]) => true,
  },
}, (props, { emit }) => {
  const updateValue = (option: CheckboxOption) => {
    const newValue = [...props.modelValue]
    const index = newValue.indexOf(option.value)
    if (index === -1) {
      newValue.push(option.value)
    }
    else {
      newValue.splice(index, 1)
    }
    emit('update:modelValue', newValue)
  }

  return () => (
    <div class={mc('flex gap-2 flex-wrap', props.class)}>
      {props.options.map(option => (
        <div key={option.value} class="flex items-center gap-2">
          <Checkbox
            modelValue={props.modelValue?.includes(option.value)}
            disabled={props.disabled}
            onUpdate:modelValue={() => updateValue(option)}
          />
          <span class={mc(props.disabled ? 'text-gray-400' : '')}>
            {option.label}
          </span>
        </div>
      ))}
    </div>
  )
})
