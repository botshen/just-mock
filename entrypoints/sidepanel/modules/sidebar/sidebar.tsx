import { createComponent } from '@/share/create-component'
import logoUrl from '@/assets/log.svg';
import logoActiveUrl from '@/assets/log-active.svg';
import { RouterLink } from 'vue-router'
 //6348e4
export const Sidebar = createComponent(null, () => {
  return () => (
    <div class=" bg-[#f5f5f5] flex flex-col items-center justify-center space-y-4 h-full">
      <RouterLink to="/" class="text-white text-center text-lg font-semibold hover:bg-gray-300 rounded-full p-2">
       <img src={logoUrl} alt="vue" class="w-6 h-6" />
      </RouterLink>
      <RouterLink to="/projects" class="text-white text-center text-lg font-semibold hover:bg-gray-300 rounded-full p-2">
      <img src={logoActiveUrl} alt="vue" class="w-6 h-6" /> 
      </RouterLink>
      <RouterLink to="/settings" class="text-white text-center text-lg font-semibold hover:bg-gray-300 rounded-full p-2">
      <img src={logoUrl} alt="vue" class="w-6 h-6" />
      </RouterLink>
    </div>
  )
})
