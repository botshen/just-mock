import { createComponent } from '@/share/create-component'
import { RouterLink } from 'vue-router'
 
export const Sidebar = createComponent(null, () => {
  return () => (
    <div class=" bg-gray-200 flex flex-col items-center justify-center space-y-4">
      <RouterLink to="/" class="text-white text-center text-lg font-semibold hover:bg-gray-300 rounded-full p-2">
       log
      </RouterLink>
      <RouterLink to="/projects" class="text-white text-center text-lg font-semibold hover:bg-gray-300 rounded-full p-2">
        projects
      </RouterLink>
      <RouterLink to="/settings" class="text-white text-center text-lg font-semibold hover:bg-gray-300 rounded-full p-2">
        settings
      </RouterLink>
    </div>
  )
})
