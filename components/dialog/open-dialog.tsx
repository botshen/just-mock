import type { Options2Props } from '@/share/create-component'
import type { DialogOptions } from './dialog'
import { createId } from '@/share/id-helper'
import { useDialogStore } from './use-dialog-store'

export function openDialog(props: Options2Props<DialogOptions>) {
  const { add, remove } = useDialogStore()
  const id = createId()
  add({ id, props })
  return () => remove(id)
}
