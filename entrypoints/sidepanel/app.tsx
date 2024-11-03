import { Dialog } from '@/components/dialog/dialog'
import { useDialogStore } from '@/components/dialog/use-dialog-store'
import { Sidebar } from '@/entrypoints/sidepanel/modules/sidebar/sidebar'
import { createComponent } from '@/share/create-component'
import { RouterView } from 'vue-router'

export const App = createComponent(null, () => {
  const { list, remove } = useDialogStore()

  return () => (
         <div class="flex flex-col  ">
          <div class="grow overflow-auto">
            <RouterView /> 
          </div> 
          <Sidebar class="fixed bottom-0" /> 
        </div> 
    )
})
  