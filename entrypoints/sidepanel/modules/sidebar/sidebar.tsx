import logoUrl from '@/assets/log.svg'
import logoActiveUrl from '@/assets/log-active.svg'
import projectUrl from '@/assets/project.svg'
import projectActiveUrl from '@/assets/project-active.svg'
import routeUrl from '@/assets/route.svg'
import settingUrl from '@/assets/setting.svg'
import settingActiveUrl from '@/assets/setting-active.svg'
import { createComponent } from '@/share/create-component'
import { RouterLink, useRoute } from 'vue-router'

export const Sidebar = createComponent(null, () => {
  const linkClass = (path: string) => {
    const baseClass = 'w-10 h-10 flex hover:bg-blue-50 items-center justify-center  text-gray-600 text-center text-lg font-semibold rounded-full p-2 mb-2'
    return route.path === path
      ? `${baseClass} bg-blue-50`
      : baseClass
  }
  const route = useRoute()
  const { t } = i18n

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
      <RouterLink to="/" class={linkClass('/')}>
        {renderIcon('/log', logoActiveUrl, logoUrl, t('interceptedApi'))}
      </RouterLink>
      <RouterLink to="/projects" class={linkClass('/projects')}>
        {renderIcon('/projects', projectActiveUrl, projectUrl, t('savedApi'))}
      </RouterLink>
      <RouterLink to="/reroute" class={linkClass('/reroute')}>
        {renderIcon('/reroute', routeUrl, routeUrl, t('reroute'))}
      </RouterLink>
      <RouterLink to="/settings" class={linkClass('/settings')}>
        {renderIcon('/settings', settingActiveUrl, settingUrl, t('settings'))}
      </RouterLink>
    </div>
  )
})
