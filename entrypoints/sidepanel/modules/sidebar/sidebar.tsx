import logoUrl from '@/assets/log.svg'
import logoActiveUrl from '@/assets/log-active.svg'
import projectUrl from '@/assets/project.svg'
import projectActiveUrl from '@/assets/project-active.svg'
import settingUrl from '@/assets/setting.svg'
import settingActiveUrl from '@/assets/setting-active.svg'
import { createComponent } from '@/share/create-component'
import { RouterLink, useRoute } from 'vue-router'

export const Sidebar = createComponent(null, () => {
  const linkClass = 'text-gray-600 text-center text-lg font-semibold   rounded-full p-2'
  const route = useRoute()

  const renderIcon = (path: string, activeIcon: string, defaultIcon: string, alt: string) => {
    const iconUrl = route.path === path ? activeIcon : defaultIcon
    return (
<div class="tooltip   tooltip-top" data-tip={alt}>
      <img src={iconUrl} alt={alt} class="w-6 h-6" />
</div>
)
  }

  return () => (
    <div class="bg-white flex gap-4 w-full items-center justify-center">
      <RouterLink to="/" class={linkClass}>
        {renderIcon('/', logoActiveUrl, logoUrl, '拦截的接口')}
      </RouterLink>
      <RouterLink to="/projects" class={linkClass}>
        {renderIcon('/projects', projectActiveUrl, projectUrl, '已保存的接口')}
      </RouterLink>
      <RouterLink to="/settings" class={linkClass}>
        {renderIcon('/settings', settingActiveUrl, settingUrl, '设置')}
      </RouterLink>
    </div>
  )
})
