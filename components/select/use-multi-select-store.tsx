import type { Key } from '@/share/ui-helper'
import { createCachedFn } from '@/share/ui-helper'
import { SvgIcon } from '@/svg-icon/svg-icon'
import { shallowRef } from 'vue'

export const useMultiSelectStore = createCachedFn((_key: Key) => {
  const icons = shallowRef({
    removeItem: <SvgIcon name="select-clear" class="size-4" colored />,
    clear: <SvgIcon name="select-clear" class="size-4" colored />,
    up: <SvgIcon name="select-down" class="size-4 rotate-180" colored />,
    down: <SvgIcon name="select-down" class="size-4" colored />,
    unchecked: '○',
    checked: '●',
  })

  return {
    icons,
  }
})
