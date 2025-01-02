import { Dialog } from '@/components/dialog/dialog'
import { useDialogStore } from '@/components/dialog/use-dialog-store'
import { usePopoverStore } from '@/components/popover/use-popover-store'
import { Sidebar } from '@/entrypoints/sidepanel/modules/sidebar/sidebar'
import { createComponent } from '@/share/create-component'
import { RouterView } from 'vue-router'

export const App = createComponent(null, () => {
  const { list, remove } = useDialogStore()
  const { renderPopovers } = usePopoverStore()

  return () => (
    <div class="flex flex-col">
      <div class="grow overflow-auto">
        <RouterView />
        {renderPopovers()}
      </div>
      {
        list.value.map(({ id, props }, index, array) => {
          const isMaxId = id === Math.max(...array.map(item => item.id))
          return (
            <Dialog
              key={`dialog:${id}`}
              {...props}
              visible={isMaxId}
              onClose={() => remove(id)}
            />
          )
        })
      }
      <Sidebar class="fixed bottom-0" />
    </div>
  )
})
