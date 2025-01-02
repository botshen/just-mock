import type { SlotFn } from '@/share/create-component'
import type { ClassName } from '@/share/typings'
import type { VNode } from 'vue'
import { usePopover } from '@/components/popover/use-popover'
import { createComponent, fn } from '@/share/create-component'
import { createStringId } from '@/share/id-helper'
import { MergeClass } from '@/share/merge-class'
import { mc, withStopPropagation } from '@/share/ui-helper'
import { onClickOutside, useDebounceFn } from '@vueuse/core'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useMultiSelectStore } from './use-multi-select-store'

interface InputOption<D = unknown> {
  label: string
  value: D
  disabled?: boolean
}
type SimpleValue = string | number | boolean
export interface FormMultiSelectOptions<D = unknown> {
  props: {
    class: ClassName
    modelValue?: D[]
    options?: Array<InputOption<D>> | (() => VNode | string | null)
    placeholder?: string
    clickBehavior?: 'select' | 'toggle'
    maxlength?: number | null
    search?: boolean | {
      placeholder?: string
      debounce?: number
    } | null
    popoverWrapperClass?: ClassName
    disabledItemClass?: ClassName
    onClear?: null | (() => void)
  }
  emits: {
    'update:modelValue': (value: D[]) => void
    'update:keyword': (keyword: string) => void
    'maxlengthExceeded': () => void
    'popoverVisible': (visible: boolean) => void
  }
  slots: {
    loadingOptions?: SlotFn
    emptyOptions?: SlotFn
  }
}
export function CreateFormMultiSelect<D extends SimpleValue>() {
  return createComponent<FormMultiSelectOptions<D>>({
    name: 'FormMultiSelect',
    props: {
      class: '',
      modelValue: [],
      options: [],
      placeholder: 'place select',
      clickBehavior: 'toggle',
      maxlength: null,
      search: null,
      popoverWrapperClass: '',
      disabledItemClass: '',
      onClear: null,
    },
    emits: {
      'update:modelValue': fn,
      'update:keyword': fn,
      'maxlengthExceeded': fn,
      'popoverVisible': fn,
    },
  }, (props, { emit }) => {
    const keyword = ref('')
    const popoverVisible = ref(false)
    const uniqueId = createStringId()
    const labelWrapper = ref<HTMLElement | null>(null)
    const availableOptions = computed(() => {
      if (typeof props.options === 'function') {
        return props.options()
      }
      return props.options.filter(option =>
        keyword.value ? option.label.toString().toLowerCase().includes(keyword.value.toLowerCase()) : true)
    })
    const hoveredIndex = ref(-1)
    onClickOutside(labelWrapper, () => {
      popoverVisible.value = false
    })
    const debounce = typeof props.search === 'object' ? props.search?.debounce : 300
    const onUpdateKeyword = useDebounceFn((value) => {
      keyword.value = value
      emit('update:keyword', value)
    }, debounce)
    const updateModelValue = (value: D[]) => {
      if (props.maxlength && value.length > props.maxlength) {
        emit('maxlengthExceeded')
        return
      }
      emit('update:modelValue', value)
    }
    const addModelValue = (value: D) => {
      if (props.maxlength === 1) {
        updateModelValue([value])
        return
      }
      updateModelValue([...props.modelValue, value])
    }
    const clear = () => {
      if (props.onClear) {
        props.onClear()
      }
      else {
        updateModelValue([])
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (!availableOptions.value || !Array.isArray(availableOptions.value)) { return }
      if (e.key === 'ArrowDown') {
        hoveredIndex.value = Math.min(hoveredIndex.value + 1, availableOptions.value.length - 1)
        e.preventDefault()
      }
      else if (e.key === 'ArrowUp') {
        hoveredIndex.value = Math.max(hoveredIndex.value - 1, 0)
        e.preventDefault()
      }
      else if (e.key === 'Enter') {
        const value = availableOptions.value[hoveredIndex.value]?.value
        if (value) {
          addModelValue(value)
        }
      }
    }
    const onClickOption = (option: InputOption<D>) => {
    // 删除已选项
      if (props.clickBehavior === 'toggle' && props.modelValue.includes(option.value)) {
        updateModelValue(props.modelValue.filter(value => value !== option.value))
        return
      }
      // 添加选项
      addModelValue(option.value)
      if (props.maxlength === 1) {
        toggle()
      }
    }
    const width = ref(0)
    onMounted(() => {
      width.value = labelWrapper.value?.getBoundingClientRect().width ?? 0
    })
    const { visible, toggle } = usePopover({
      triggerElement: labelWrapper,
      triggerType: 'click',
      useFlip: false,
      placement: 'bottom-start',
      offset: 8,
      arrowVisible: false,
      class: 'rounded-md',
      wrapperClass: ['drop-shadow-center', props.popoverWrapperClass].join(' '),
      content: () => (
        <x-popover class={['border border-t-0 block']} style={{ width: `${width.value}px` }}>
          <div class="bg-white">
            {props.search && (
              <>
                <input
                  autocomplete="off"
                  id={uniqueId}
                  class="w-full py-1 px-2 outline-none"
                  value={keyword.value}
                  onInput={e => onUpdateKeyword((e.target as HTMLInputElement).value)}
                  onKeydown={onKeyDown}
                  placeholder={(typeof props.search === 'object' && props.search.placeholder) || 'Search'}
                />
                <hr />
              </>
            )}
            <ul class="max-h-[22em] overflow-auto">
              {Array.isArray(availableOptions.value)
                ? availableOptions.value.map((option, index) => {
                  const selected = props.modelValue.includes(option.value)
                  return (
                    <li
                      class={mc(
                        'px-2 flex items-center gap-x-2 h-8 text-sm text-[#666]',
                        hoveredIndex.value === index ? 'bg-[#f6f6f6]' : '',
                        // selected ? 'bg-[#f6f6f6]' : '',
                        option.disabled ? props.disabledItemClass : '',
                      )}
                      onMouseenter={() => { hoveredIndex.value = index }}
                      onClick={option.disabled
                        ? undefined
                        : () => {
                            onClickOption(option)
                          }}
                    >
                      {
                        props.maxlength && props.maxlength > 1
                          ? (
                              <span class="size-4 inline-flex items-center justify-center shrink-0 grow-0 text-primary">
                                {selected ? icons.value.checked : icons.value.unchecked}
                              </span>
                            )
                          : null
                      }
                      <span class="flex-1 truncate">{option.label}</span>
                    </li>
                  )
                })
                : availableOptions.value}
            </ul>
          </div>
        </x-popover>
      ),
    })
    const labelInner = ref<HTMLElement | null>(null)
    // 新增选项时滚动到底部
    watch(() => props.modelValue.length, (newLength, oldLength) => {
      if (newLength > oldLength) {
        void nextTick(() => {
          labelInner.value?.scrollTo({ top: labelInner.value.scrollHeight })
        })
      }
    })
    const onRemoveItem = (value: D) => {
      const found = Array.isArray(props.options) && props.options.find(item => item.value === value)
      if (found && found.disabled)
        return
      updateModelValue(props.modelValue.filter(item => item !== value))
    }
    const { icons } = useMultiSelectStore()
    watch(visible, (newValue) => {
      emit('popoverVisible', newValue)
    })
    return () => {
      return (
        <MergeClass tag="x-multi-select" baseClass="block rounded h-8 min-w-[200px] relative text-sm">
          <label
            ref={labelWrapper}
            class={mc('flex flex-nowrap border border-line-1 rounded bg-white relative z-up group', visible.value ? 'max-h-[80px] h-auto' : 'h-full', popoverVisible.value ? 'border-[#4e5575] border-2' : 'border-[#ccc]', props.class)}
            for={uniqueId}
            onClick={() => { popoverVisible.value = true }}
          >
            <div
              ref={labelInner}
              class={['flex gap-x-1 gap-y-1 leading-none px-1 overflow-auto w-full relative', visible.value ? 'flex-wrap items-start py-[3px] translate-y-[1px]' : 'flex-nowrap hide-scrollbar items-center']}
            >
              {props.modelValue.length > 0
                ? props.modelValue.map(value => (
                  findLabelFromOptions(value, props.options, ({ label, disabled }) => (
                    <x-label class="px-1 py-[4px] rounded-md truncate shrink-0 grow-0 inline-flex items-center gap-x-1 max-w-[200px]">
                      <x-name class="truncate" title={label}>{label}</x-name>
                      {(!disabled && props.maxlength && props.maxlength > 1) && (
                        <x-remove class="size-[14px] relative" onClick={(e: Event) => { e.stopPropagation(); onRemoveItem(value) }}>
                          <span class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            {' '}
                            {icons.value.removeItem}
                            {' '}
                          </span>
                        </x-remove>
                      )}
                    </x-label>
                  ))
                ))
                : <span class="uppercase mx-2 text-[#999999] text-sm">{props.placeholder}</span>}
            </div>
            <div class="relative flex flex-nowrap h-full shrink-0 grow00">
              {visible.value || props.modelValue.length === 0 || props.maxlength === 1
                ? null
                : (
                    <span class="px-2 shrink-0 flex cursor-pointer justify-center items-center border-r">
                      已选
                      {props.modelValue.length}
                      项
                    </span>
                  )}
              {
                props.modelValue.length > 0 && (
                  <span
                    class="shrink-0 flex cursor-pointer justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="清空"
                    onClick={withStopPropagation(() => clear())}
                  >
                    {icons.value.clear}
                  </span>
                )
              }
              <span class="w-[30px] h-[30px] shrink-0 flex cursor-pointer justify-center items-center self-start">
                {visible.value ? icons.value.up : icons.value.down}
              </span>
            </div>
          </label>

        </MergeClass>
      )
    }
  })
}

function findLabelFromOptions(value: string | number | boolean, options: InputOption[] | (() => VNode | string | null), callback: (p: { label: unknown, disabled?: boolean }) => unknown) {
  if (typeof options === 'function') {
    return null
  }
  const option = options.find(option => option.value === value)
  return option ? callback(option) : callback({ label: value, disabled: false })
}
