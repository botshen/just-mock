import type { SlotFn } from '@/share/create-component'
import type { ClassName } from '@/share/typings'
import type { VNode, VNodeChild } from 'vue'
import { Input } from '@/components/input/input'
import { CreateFormMultiSelect } from '@/components/select/multi-select'
import { createComponent, fn, required } from '@/share/create-component'
import { createStringId } from '@/share/id-helper'
import { mc } from '@/share/ui-helper'
import { SvgIcon } from '@/svg-icon/svg-icon'

type SimpleValue = string | number | boolean

interface FormOptions {
  props: {
    class?: ClassName
  }
  emits: {
    submit: (e: Event) => void
  }
  slots: {
    default: SlotFn
  }
}

export const Form = createComponent<FormOptions>({
  props: {
    class: '',
  },
  emits: {
    submit: fn,
  },
}, (props, { emit, slots }) => {
  return () => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        emit('submit', e)
      }}
      class={mc('w-full', props.class)}
    >
      { slots.default?.() }
    </form>
  )
})

interface FormItemProps {
  inputId?: string | null
  label?: string
  rightComponent?: (() => VNodeChild) | null
  modelValue?: SimpleValue | SimpleValue[]
  type?: 'text' | 'password' | 'textarea' | 'slot' | 'multi-select' | 'date-picker' | 'select'
  maxLength?: number
  error?: string
  placeholder?: string
  options?: Array<{ label: string, value: SimpleValue }> | (() => VNode | string | null)
  countFrom?: number
  disabled?: boolean
  class?: string
  formItemClass?: string
  inputClass?: string
  errorInLabel?: boolean
  passwordClass?: string
  maxSelectCount?: number
  prefix?: (() => VNodeChild) | null
  search?: boolean | {
    placeholder?: string
    debounce?: number
  } | null
  contentClass?: string
}

type Emits = ['update:modelValue', 'update:keyword', 'click', 'popoverVisible', 'clear']

export const FormItem = createComponent<{ props: FormItemProps, emits: Emits, slots: { default: SlotFn } }>({
  props: {
    prefix: null,
    inputId: null,
    label: '',
    modelValue: required,
    inputClass: '',
    type: required,
    error: '',
    placeholder: '',
    options: [],
    countFrom: 60,
    disabled: false,
    class: '',
    maxLength: -1,
    rightComponent: null,
    formItemClass: '',
    errorInLabel: false,
    passwordClass: '',
    maxSelectCount: 1,
    search: null,
    contentClass: '',
  },
  emits: ['update:modelValue', 'update:keyword', 'click', 'popoverVisible', 'clear'],
}, (props, context) => {
  const timer = ref<number>()
  const FormMultiSelect = CreateFormMultiSelect()
  const count = ref<number>(props.countFrom || 60)
  const showPassword = ref(false)
  const hasError = computed(() => !!props.error)
  const inputClass = computed(() => {
    const baseClass = `px-2 text-[14px] w-full border-[#cccccc] rounded grow border `
    return hasError.value
      ? `${baseClass} !border-2 !border-[#E10505]`
      : baseClass
  })

  const textareaClass = computed(() => {
    const baseClass = `p-2 text-[14px] rounded w-full grow border border-solid border-[#cccccc] outline-none focus:outline-none`
    return hasError.value
      ? `${baseClass} !border-2 !border-[#E10505]`
      : baseClass
  })
  const selectClass = computed(() => {
    const baseClass = ``
    return hasError.value
      ? `${baseClass} !border-2 !border-[#E10505]`
      : baseClass
  })

  const startCount = () =>
    timer.value = setInterval(() => {
      count.value -= 1
      if (count.value === 0) {
        clearInterval(timer.value)
        timer.value = undefined
        count.value = props.countFrom ?? 60
      }
    }, 1000) as unknown as number
  context.expose({ startCount })
  const finalId = props.inputId ?? createStringId('form-item-')

  const content = () => {
    switch (props.type) {
      case 'text':
        return (
          <Input
            id={finalId}
            modelValue={props.modelValue as string}
            placeholder={props.placeholder}
            class={mc(inputClass.value, props.inputClass, props.class)}
            disabled={props.disabled}
            onUpdate:modelValue={val => context.emit('update:modelValue', val)}
            v-slots={{
              prefix: props.prefix,
            }}
          />
        )
      case 'password':
        return (
          <div class="relative">
            <Input
              id={finalId}
              modelValue={props.modelValue as string}
              type={showPassword.value ? 'text' : 'password'}
              placeholder={props.placeholder}
              disabled={props.disabled}
              class={mc(inputClass.value, 'pr-8', props.inputClass, props.class)}
              onUpdate:modelValue={val => context.emit('update:modelValue', val)}
            />
            <div
              class={mc('cursor-pointer absolute right-[10px] top-[50%] -translate-y-[50%] grow-0 w-4 h-4', props.passwordClass)}
              onClick={(e: Event) => {
                e.stopPropagation()
                showPassword.value = !showPassword.value
              }}
            >
              <SvgIcon class="w-4 h-4" name={showPassword.value ? 'eye' : 'no-eye'} colored />
            </div>
          </div>
        )
      case 'textarea':
        return (
          <textarea
            id={finalId}
            maxlength={props.maxLength ?? 100}
            value={props.modelValue as string}
            placeholder={props.placeholder}
            class={mc(textareaClass.value, props.class)}
            disabled={props.disabled}
            onInput={(e: Event) => context.emit('update:modelValue', (e.target as HTMLTextAreaElement).value)}
          />
        )
      case 'select':
        return (
          <FormMultiSelect
            class={selectClass.value}
            options={props.options}
            modelValue={props.modelValue ? [props.modelValue as SimpleValue] : []}
            onUpdate:modelValue={(val: SimpleValue[]) => context.emit('update:modelValue', val[0] || '')}
            maxlength={1}
            clickBehavior="select"
            search={props.search}
            placeholder={props.placeholder}
            onUpdate:keyword={(val: string) => context.emit('update:keyword', val)}
            onPopoverVisible={(visible: boolean) => context.emit('popoverVisible', visible)}
            onClear={() => context.emit('clear')}
          />
        )
      case 'multi-select':
        return (
          <FormMultiSelect
            class={mc(props.class, selectClass.value)}
            options={props.options}
            modelValue={props.modelValue as unknown as SimpleValue[]}
            onUpdate:modelValue={(val: SimpleValue[]) => context.emit('update:modelValue', val)}
            maxlength={props.maxLength}
            clickBehavior="toggle"
            search={props.search}
            placeholder={props.placeholder}
            onUpdate:keyword={(val: string) => context.emit('update:keyword', val)}
            onPopoverVisible={(visible: boolean) => context.emit('popoverVisible', visible)}
          />
        )

      case 'slot':
        return context.slots.default?.({ hasError: hasError.value })
    }
  }
  return () => {
    return (
      <x-form-item class={`block ${props.formItemClass}`}>
        <div class="flex justify-between items-center">
          {props.label
          && <label for={finalId} class="font-bold text-[14px] mb-[6px]">{props.label}</label>}
          {props.rightComponent
          && <div class="flex items-center">{props.rightComponent()}</div>}
          {props.errorInLabel
          && <div class="flex text-[#E10505] items-center text-xs">{props.error ?? '　'}</div>}
        </div>
        <div class="flex">
          <x-content class={mc('block flex-grow translate-y-[1px] z-up', props.contentClass)}>
            {content()}
          </x-content>
        </div>
        {
          (!props.errorInLabel && props.error) && (
            <x-error class="block mt-1 text-[#E10505] text-xs">
              <span>{props.error ?? '　'}</span>
            </x-error>
          )
        }
      </x-form-item>
    )
  }
})
