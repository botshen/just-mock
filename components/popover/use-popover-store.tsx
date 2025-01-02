import type { Key } from '@/share/ui-helper'
import type { Placement } from '@floating-ui/dom'
import type { VNodeChild } from 'vue'
import { createStringId } from '@/share/id-helper'
import { createCachedFn } from '@/share/ui-helper'
import { ref } from 'vue'
import { Popover } from './popover'

export interface PopoverProps {
  id?: string
  triggerType?: 'click' | 'hover' | 'focus' | 'manual'
  triggerElement: unknown
  content: (() => VNodeChild) | null
  placement?: Placement // 弹窗位置
  offset?: number // 弹窗偏移量
  offsetElement?: unknown // 相对偏移的元素
  arrowVisible?: boolean
  arrowOffset?: number // 箭头偏移量
  arrowClass?: string
  class?: string
  wrapperClass?: string
  useFlip?: boolean
}

interface PopoverEvents {
  remove?: () => void
  cancelAsyncClose?: () => void
}

export const usePopoverStore = createCachedFn((_key: Key) => {
  const popoverQueue = ref<Array<{ popover: PopoverProps, popoverEvents?: PopoverEvents }>>([])

  const addPopover = (popover: PopoverProps, popoverEvents?: PopoverEvents) => {
    const id = createStringId()
    popoverQueue.value.push({ popover: { ...popover, id }, popoverEvents })
    return id
  }
  /**
   * 删除popover
   * @param id
   */
  const removePopover = (id: string) => {
    const index = popoverQueue.value.findIndex(item => item.popover.id === id)
    popoverQueue.value.splice(index, 1)
  }

  const renderPopovers = () => {
    return popoverQueue.value.map(item => (
      <div class="" key={item.popover.id}>
        <Popover
          {...item.popover}
          onRemove={item.popoverEvents?.remove}
          onCancelAsyncClose={item.popoverEvents?.cancelAsyncClose}
        />
      </div>
    ))
  }

  return {
    popoverQueue,
    addPopover,
    removePopover,
    renderPopovers,
  }
})
