import { createComponent, fn } from '@/share/create-component'
import { ClassName } from '@/share/typings'
import { mc } from '@/share/ui-helper'
import { VNodeChild } from 'vue'
import closeUrl from '@/assets/close.svg'
export type DialogOptions = {
  props: {
    visible?: boolean
    content?: (() => VNodeChild) | null
    class?: ClassName
    hideHeader?: boolean
  }
  emits: {
    close: () => void
  }
  slots: {
    default: () => void
  }
}

export const Dialog = createComponent<DialogOptions>({
  props: {
    visible: false,
    content: null,
    class: '',
    hideHeader: false,
  },
  emits: {
    close: fn,
  },
}, (props, { emit, slots, attrs }) => {
  const handleClose = () => {
    emit('close')
  }

  return () => (
    <dialog 
      class={mc('rounded-2xl', props.visible ? '' : 'hidden', props.class)} 
      open={props.visible}
      {...attrs}
    >
      <div class="relative">
        {
          !props.hideHeader && (
            <button class="absolute top-4 right-4" onClick={handleClose}>
              <img src={closeUrl} alt="close" class="w-[12px] h-[12px]" />
            </button>
          )
        }
        <div>
          {props.content?.() ?? slots.default?.()}
        </div>
      </div>
    </dialog>
  )
})