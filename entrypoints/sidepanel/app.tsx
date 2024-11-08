import { Sidebar } from '@/entrypoints/sidepanel/modules/sidebar/sidebar'
import { createComponent } from '@/share/create-component'
import { RouterView } from 'vue-router'

export const App = createComponent(null, () => {
  return () => (
    <div class="flex flex-col">
      <div class="grow overflow-auto">
        <RouterView />
      </div>
      <Sidebar class="fixed bottom-0" />
    </div>
  )
})
