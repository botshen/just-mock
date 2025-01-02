import type { Key } from '@/share/ui-helper'
import { createCachedFn } from '@/share/ui-helper'
import { shallowRef } from 'vue'

export const useMultiSelectStore = createCachedFn((_key: Key) => {
  const icons = shallowRef({
    removeItem: '❎',
    clear: '❎',
    up: '▲',
    down: '▼',
    unchecked: '○',
    checked: '●',
  })

  return {
    icons,
  }
})
