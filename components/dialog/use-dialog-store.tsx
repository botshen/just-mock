import type { Options2Props } from '@/share/create-component'
import type { DialogOptions } from './dialog'
import { ref } from 'vue'

export type DialogProps = Options2Props<DialogOptions>

interface Item { id: number, props: DialogProps }
const list = ref<Item[]>([])
export function useDialogStore() {
  const add = (item: Item) => {
    list.value.push(item)
  }
  const remove = (id: number) => {
    const index = list.value.findIndex(item => item.id === id)
    list.value.splice(index, 1)
  }
  const getPreviousDialogId = () => {
    if (list.value.length < 2)
      return null
    return list.value[list.value.length - 2].id
  }

  return { list, add, remove, getPreviousDialogId }
}

export function openPreviousDialog() {
  const { list, remove, getPreviousDialogId } = useDialogStore()
  const currentDialogId = list.value[list.value.length - 1].id
  const previousDialogId = getPreviousDialogId()

  if (previousDialogId !== null) {
    remove(currentDialogId)
    // 找到上一个弹窗并设置为可见
    const previousDialog = list.value.find(item => item.id === previousDialogId)
    if (previousDialog) {
      previousDialog.props.visible = true
    }
  }
}
