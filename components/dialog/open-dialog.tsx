 
import { Options2Props } from '@/share/create-component'
import { DialogOptions } from './dialog'
import { useDialogStore } from './use-dialog-store'
import { createId } from '@/share/id-helper'

export const openDialog = (props: Options2Props<DialogOptions>) => {
  const { add, remove } = useDialogStore()
  const id = createId()
  add({ id, props })
  return () => remove(id)
}
