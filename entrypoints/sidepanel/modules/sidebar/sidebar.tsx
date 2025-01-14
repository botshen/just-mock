import logoUrl from '@/assets/log.svg'
import logoActiveUrl from '@/assets/log-active.svg'
import projectUrl from '@/assets/project.svg'
import projectActiveUrl from '@/assets/project-active.svg'
import settingUrl from '@/assets/setting.svg'
import settingActiveUrl from '@/assets/setting-active.svg'
import { createComponent } from '@/share/create-component'
import { RouterLink, useRoute } from 'vue-router'

export const Sidebar = createComponent(null, () => {
  const linkClass = 'text-white text-center text-lg [&.router-link-exact-active]:bg-[#e1e2e3] font-semibold hover:bg-[#e1e2e3] rounded-full p-2'
  const route = useRoute()

  const renderIcon = (path: string, activeIcon: string, defaultIcon: string, alt: string) => {
    const iconUrl = route.path === path ? activeIcon : defaultIcon
    return <img src={iconUrl} alt={alt} class="w-6 h-6" />
  }

  return () => (
    <div class="bg-[#f5f5f5] flex gap-4  w-full items-center justify-center      ">
      <RouterLink to="/" class={linkClass}>
        {renderIcon('/', logoActiveUrl, logoUrl, 'vue')}
      </RouterLink>
      <RouterLink to="/projects" class={linkClass}>
        {renderIcon('/projects', projectActiveUrl, projectUrl, 'project')}
      </RouterLink>
      <RouterLink to="/settings" class={linkClass}>
        {renderIcon('/settings', settingActiveUrl, settingUrl, 'setting')}
      </RouterLink>
    </div>
  )
})
