import { LogPage } from '@/entrypoints/sidepanel/modules/log/log-page'
import { ProjectsPage } from '@/entrypoints/sidepanel/modules/projects/projects-page'
import { SettingsPage } from '@/entrypoints/sidepanel/modules/settings/settings-page'
import { createMemoryHistory, createRouter } from 'vue-router'

const routes = [
  { path: '/', component: LogPage },
  { path: '/projects', component: ProjectsPage },
  { path: '/settings', component: SettingsPage },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
