import type { Fn } from '@vueuse/core'
import type { MaybeRef } from 'vue'
import type { PopoverProps } from './use-popover-store'
import { createComponent, fn } from '@/share/create-component'
import { mc } from '@/share/ui-helper'
import { arrow, computePosition, flip, offset } from '@floating-ui/dom'
import { onClickOutside, unrefElement, useEventListener, useThrottleFn } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'

export * from './use-popover'
export * from './use-popover-store'

interface PopoverOptions {
  props: PopoverProps
  emits: {
    remove: Fn
    cancelAsyncClose: Fn
  }
}

export function findAncestor(el: SVGElement | HTMLElement | null, filterFn: (el: SVGElement | HTMLElement) => boolean) {
  if (el === null)
    return null
  while (el && el.tagName.toLowerCase() !== 'body') {
    if (filterFn(el))
      return el
    el = el.parentElement
  }
  return null
}

export const Popover = createComponent<PopoverOptions>({
  props: {
    id: '',
    triggerElement: null,
    offsetElement: null,
    content: null,
    class: '',
    arrowClass: '',
    wrapperClass: '',
    placement: 'bottom',
    arrowOffset: 50,
    arrowVisible: true,
    offset: 20,
    triggerType: 'hover',
    useFlip: true,
  },
  emits: {
    remove: fn,
    cancelAsyncClose: fn,
  },
}, (props, { emit }) => {
  const popover = ref()
  const popoverArrow = ref()
  const triggerEle = unrefElement(props.triggerElement as MaybeRef<HTMLElement>)
  const offsetEle = unrefElement(props.offsetElement as MaybeRef<HTMLElement>) ?? triggerEle
  const computePositionFn = () => {
    if (!popover.value)
      return
    void computePosition(offsetEle ?? triggerEle!, popover.value, {
      placement: props.placement ?? 'bottom',
      middleware: [
        props.useFlip && flip(),
        offset(props.offset ?? 0),
        popoverArrow.value && arrow({ element: popoverArrow.value }),
      ].filter(Boolean),
    }).then(({ x, y, placement, middlewareData }) => {
      Object.assign(popover.value.style, {
        transform: `translate(${x}px, ${y}px)`,
      })
      // 以下控制箭头位置和旋转角度
      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placement.split('-')[0]] as string
      if (!popoverArrow.value)
        return
      // @ts-expect-error 忽略ts类型检测
      const { x: arrowX, y: arrowY } = middlewareData.arrow
      Object.assign(popoverArrow.value.style, {
        left: arrowX != null ? `${arrowX}px` : '',
        top: arrowY != null ? `${arrowY}px` : '',
        rotate: `${staticSide === 'bottom' ? '180deg' : staticSide === 'right' ? '90deg' : staticSide === 'left' ? '-90deg' : ''}`,
        [placement.split('-')[0]]: '100%',
      })
    })
  }
  // 内容改变重新计算位置
  watch(() => props.content, () => {
    void computePositionFn()
  })
  useEventListener(window, 'resize', () => {
    void computePositionFn()
  })
  // 滚动
  useEventListener(window, 'scroll', () => {
    void computePositionFn()
  })
  // 使用 Observer 观察 offsetEle 的 DOM 变化
  const observer = new MutationObserver(useThrottleFn(() => {
    void computePositionFn()
  }, 64))
  onMounted(() => {
    if (!offsetEle)
      return
    observer.observe(offsetEle, { childList: true, subtree: true, characterData: true })
  })

  onMounted(() => {
    if (!popover.value)
      return
    if (props.triggerType === 'click') {
      const cleanup = onClickOutside(popover.value, (e) => {
        const inTrigger = findAncestor(e.target as HTMLElement, el => el === triggerEle)
        if (inTrigger)
          return
        emit('remove')
        cleanup()
      })
    }
    else if (props.triggerType === 'hover') {
      const cleanupMouseenter = useEventListener(popover.value, 'mouseenter', () => {
        emit('cancelAsyncClose')
        cleanupMouseenter()
      })
      const cleanupMouseleave = useEventListener(popover.value, 'mouseleave', () => {
        emit('remove')
        cleanupMouseleave()
      })
    }
    else if (props.triggerType === 'focus') {
      const cleanupClick = useEventListener(popover.value, 'click', () => {
        emit('cancelAsyncClose')
        cleanupClick()
      })
      const cleanup = onClickOutside(popover.value, (e) => {
        const inTrigger = findAncestor(e.target as HTMLElement, el => el === triggerEle)
        if (inTrigger)
          return
        emit('remove')
        cleanup()
      })
    }
    if (!triggerEle && !offsetEle)
      return
    void computePositionFn()
  })

  const computedArrowStyle = computed(() => {
    if (!props.arrowOffset)
      return ''
    if (!props.placement || props.placement.split('-')[0] === 'top' || props.placement.split('-')[0] === 'bottom') {
      return {
        height: '12px',
        width: `${24 + 2 * (props.arrowOffset !== undefined ? props.arrowOffset : 0)}px`,
      }
    }
    return {
      height: `${12 + 2 * (props.arrowOffset !== undefined ? props.arrowOffset : 0)}px`,
      width: '12px',
    }
  })

  return () => (
    <x-popover-wrapper class={mc('block absolute left-0 top-0 drop-shadow z-up', props.wrapperClass)} ref={popover}>
      {
        props.arrowVisible && (
          <div
            class="pointer-events-none absolute z-up"
            ref={popoverArrow}
            style={computedArrowStyle.value}
          >
            <div
              class={
                mc(
                  'absolute left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2 border-b-[12px] border-l-[12px] border-r-[12px] border-b-[currentColor] border-l-transparent border-r-transparent text-[#E3F2FF]',
                  props.arrowClass,
                )
              }
            />
          </div>
        )
      }
      <div class={mc('h-full w-full overflow-hidden rounded-2xl', props.class)}>
        {props.content instanceof Function ? props.content() : props.content}
      </div>
    </x-popover-wrapper>

  )
})
