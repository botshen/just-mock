import { Dialog } from '@/components/dialog/dialog'
import { useDialogStore } from '@/components/dialog/use-dialog-store'
import { usePopoverStore } from '@/components/popover/use-popover-store'
import { Sidebar } from '@/entrypoints/sidepanel/modules/sidebar/sidebar'
import { createComponent } from '@/share/create-component'
import { nanoid } from 'nanoid'
import { RouterView } from 'vue-router'
import { useLogsStore } from './modules/store/use-logs-store'

export const App = createComponent(null, () => {
  const { list, remove } = useDialogStore()
  const { list: logsList } = useLogsStore()

  const { renderPopovers } = usePopoverStore()
  const sendToPanelHandler = (message: any) => {
    if (!Array.isArray(logsList.value)) {
      logsList.value = []
    }
    const rule = message.data
    logsList.value.unshift({
      id: nanoid(),
      url: rule.url,
      status: rule.status,
      mock: rule.mock ? 'mock' : 'real',
      type: rule.type,
      payload: rule.payload,
      delay: rule?.delay ?? 0,
      response: rule?.response,
      active: true,
    })
  }

  onMessage('sendToSidePanel', sendToPanelHandler)
  return () => (
    <div class="flex flex-col h-[100vh]">
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
      <Sidebar />
    </div>
  )
})
