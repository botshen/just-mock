import { createComponent, type SlotFn } from '@/share/create-component'
import { mc } from '@/share/ui-helper'
import { cva } from 'class-variance-authority'

const tagStyles = cva(
  'border border-solid rounded  border-[#ccc] flex items-center gap-4',
  {
    variants: {
      level: {
        normal: 'h-6 text-[#666] py-1 px-2 w-fit bg-[#F6F6F6] cursor-pointer',
      },
    },
    defaultVariants: {
      level: 'normal',
    },
  },
)

interface Options {
  props: {
    level?: 'normal'
  }
  emits: ['click']
  slots: {
    default: SlotFn
  }
}

export const Tag = createComponent<Options>({
  props: {
    level: 'normal',
  },
  emits: ['click'],

}, (props, { emit, slots }) => {
  const handleClick = (e: MouseEvent) => {
    emit('click', e)
  }
  return () => (
    <div
      class={mc('whitespace-nowrap', tagStyles({ level: props.level }))}
      onClick={handleClick}
    >
      {slots.default?.()}
    </div>
  )
})
