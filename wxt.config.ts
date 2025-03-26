import path, { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vueJsx from '@vitejs/plugin-vue-jsx'

import { defineConfig } from 'wxt'

const projectRoot = dirname(fileURLToPath(import.meta.url))

// See https://wxt.dev/api/config.html
const isCustomElement = (x: string) => x.startsWith('x-')

const projectPath = (path: string) => join(projectRoot, path)

export default defineConfig({
  extensionApi: 'chrome',
  modules: [
    '@wxt-dev/module-vue',
    '@wxt-dev/i18n/module',
    '@wxt-dev/auto-icons',
  ],
  vite: () => ({
    plugins: [
      vueJsx({ transformOn: true, mergeProps: true, enableObjectSlots: true, isCustomElement, defineComponentName: ['defineComponent', 'createComponent'] }),
    ],
    resolve: {
      alias: {
        '@': projectPath('/'),
      },
    },
  }),
  runner: {
    disabled: true,
  },
  manifest: {
    side_panel: {
      default_path: 'entrypoints/sidepanel/index.html',
      default_width: 800,
    },
    action: {},
    name: 'MockMaster: Browser API Response Simulator',
    description: 'Intercept and simulate browser network requests. Customize API responses for frontend development without backend dependencies.',
    version: '0.0.1',
    permissions: [
      'sidePanel',
     ],
    web_accessible_resources: [
      {
        resources: ['/injected.js'],
        matches: ['<all_urls>'],
      },
    ],
  },
  autoIcons: {
    grayscaleOnDevelopment: false,
  },
})
