import type { MaybeRef } from 'vue'
import type { PopoverProps } from './use-popover-store'
import { unrefElement } from '@vueuse/core'
import { computed, onUnmounted, ref, watch } from 'vue'
import { usePopoverStore } from './use-popover-store'

export function usePopover(options: Omit<PopoverProps, 'id'>) {
  const { triggerType = 'hover' } = options
  const popoverStore = usePopoverStore()
  const id = ref<string | number>()
  let timer: null | number = null

  const cancelAsyncClose = () => {
    if (timer) {
      window.clearTimeout(timer)
      timer = null
    }
  }
  const remove = () => {
    cancelAsyncClose()
    if (id.value === undefined)
      return
    popoverStore.removePopover(id.value as string)
    id.value = undefined
  }
  const close = () => {
    remove()
  }
  const asyncClose = (delay = 200) => {
    if (id.value === undefined)
      return
    timer = window.setTimeout(remove, delay)
  }

  const open = () => {
    cancelAsyncClose()
    if (id.value)
      return
    id.value = popoverStore.addPopover(options, {
      cancelAsyncClose,
      remove,
    })
  }
  const toggle = () => {
    if (id.value) {
      remove()
    }
    else {
      open()
    }
  }
  watch([options.triggerElement], () => {
    const ele = unrefElement(options.triggerElement as MaybeRef<HTMLElement>)
    if (!ele)
      return
    if (triggerType === 'hover') {
      ele.addEventListener('mouseenter', () => {
        open()
      })
      ele.addEventListener('mouseleave', () => {
        asyncClose()
      })
    }
    else if (triggerType === 'click') {
      ele.addEventListener('click', () => {
        toggle()
      })
    }
    else if (triggerType === 'focus') {
      ele.addEventListener('focus', () => {
        open()
      })
      ele.addEventListener('blur', () => {
        asyncClose()
      })
    }
  })

  const visible = computed(() => id.value !== undefined)

  onUnmounted(() => {
    close()
  })

  return {
    visible,
    open,
    close,
    remove,
    toggle,
    cancelAsyncClose,
    asyncClose,
  }
}
