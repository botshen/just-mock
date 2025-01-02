import type { ClassName } from '@/share/typings'
import type { VNodeChild } from 'vue'
import closeUrl from '@/assets/close.svg'
import { createComponent, fn } from '@/share/create-component'
import { mc } from '@/share/ui-helper'

export interface DialogOptions {
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
      class={mc(
        'rounded-2xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        props.visible ? '' : 'hidden',
        props.class,
      )}
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
