import { Sidebar } from '@/entrypoints/sidepanel/modules/sidebar/sidebar'
import { createComponent } from '@/share/create-component'
import { RouterView } from 'vue-router'

export const App = createComponent(null, () => {
  return () => (
    <div class="flex h-screen">
      <div class="shrink-0 grow">
        <RouterView />
      </div>
      <Sidebar /> 
    </div>
  )
})
  