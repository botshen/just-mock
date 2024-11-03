import { createComponent } from '../../share/create-component'
import { mc } from '../../share/ui-helper'
import checkDisabledUrl from '@/assets/check-disabled.svg';
import checkedUrl from '@/assets/checked.svg';
import indeterminateUrl from '@/assets/indeterminate.svg';

type Options = {
  props: {
    modelValue?: boolean
    indeterminate?: boolean
    class?: string
    disabled?: boolean
  }
  emits: {
    'update:modelValue': (val: boolean) => void
  }
}

export const Checkbox = createComponent<Options>({
  inheritAttrs: false,
  props: {
    modelValue: false,
    indeterminate: false,
    disabled: false,
    class: '',
  },
  emits: {
    'update:modelValue': (val: boolean) => true,
  },
},
(props, { emit }) => {
  const toggle = () => {
    emit('update:modelValue', !props.modelValue)
  }

  return () => (
    <div class={mc('relative flex items-center', props.class)}>
      <input
        type="checkbox"
        checked={props.modelValue}
        class={mc(
          'absolute w-full h-full opacity-0 cursor-pointer',
          props.disabled ? 'cursor-not-allowed' : '',
        )}
        disabled={props.disabled}
        onChange={toggle}
      />
      <div class={mc(
        'w-4 h-4 border rounded flex items-center justify-center !border-[#ccc]',
        props.modelValue ? 'bg-[#4E5575] !border-[#4E5575]' : 'bg-white border-gray-300',
        props.indeterminate ? 'bg-[#4E5575] !border-[#4E5575]' : '',
        props.disabled ? 'bg-[#ccc] !border-[#ccc] ' : '',
      )}
      >
        {props.modelValue && !props.indeterminate && (
          props.disabled
            ? (
                 <img src={checkDisabledUrl} alt="check-disabled" class="w-3 h-3" />
              )
            : (
                <img src={checkedUrl} alt="checked" class="w-3 h-3" />
              )
        )}
        {props.indeterminate && (
          <img src={indeterminateUrl} alt="indeterminate" class="w-3 h-3" />
        )}
      </div>
    </div>
  )
})
