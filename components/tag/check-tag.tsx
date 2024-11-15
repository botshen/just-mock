import { createComponent, type SlotFn } from '@/share/create-component'
import { cva } from 'class-variance-authority'

const tagStyles = cva(
  'border border-solid rounded flex items-center gap-4 transition-colors',
  {
    variants: {
      level: {
        normal: 'h-6 py-1 px-2 w-fit  cursor-pointer',
      },
      checked: {
        true: 'bg-[#4E5575]  text-white',
        false: 'bg-[#F6F6F6] text-[#666]  border-[#ccc] ',
      },
    },
    defaultVariants: {
      level: 'normal',
      checked: false,
    },
    compoundVariants: [
      {
        level: 'normal',
        checked: true,
        class: 'bg-[#4E5575]  text-white',
      },
    ],
  },
)

interface Options {
  props: {
    level?: 'normal'
    checked?: boolean
  }
  emits: ['click' ]
  slots: {
    default: SlotFn
  }
}

export const CheckTag = createComponent<Options>({
  props: {
    level: 'normal',
    checked: false,
  },
  emits: ['click'],

}, (props, { emit, slots }) => {
  const handleClick = (e: MouseEvent) => {
    emit('click')
  }
  return () => (
    <div
      class={tagStyles({ level: props.level, checked: props.checked })}
      onClick={handleClick}
    >
      {slots.default?.()}
    </div>
  )
})
