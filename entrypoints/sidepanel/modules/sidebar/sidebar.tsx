import { createComponent } from '@/share/create-component'
import imageUrl from '@/assets/vue.svg';

import { RouterLink } from 'vue-router'
 
export const Sidebar = createComponent(null, () => {
  return () => (
    <div class=" bg-[#f5f5f5] flex flex-col items-center justify-center space-y-4 h-full">
      <RouterLink to="/" class="text-white text-center text-lg font-semibold hover:bg-gray-300 rounded-full p-2">
       <img src={imageUrl} alt="vue" class="w-6 h-6" />
      </RouterLink>
      <RouterLink to="/projects" class="text-white text-center text-lg font-semibold hover:bg-gray-300 rounded-full p-2">
      <img src={imageUrl} alt="vue" class="w-6 h-6" /> 
      </RouterLink>
      <RouterLink to="/settings" class="text-white text-center text-lg font-semibold hover:bg-gray-300 rounded-full p-2">
      <img src={imageUrl} alt="vue" class="w-6 h-6" />

      </RouterLink>
    </div>
  )
})
