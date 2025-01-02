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
  modules: ['@wxt-dev/module-vue'],
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
    name: 'just-mock',
    description: 'A browser extension for mocking data in the sidebar.',
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
    commands: {
      'toggle-sidebar': {
        suggested_key: {
          default: 'Ctrl+Shift+S',
          mac: 'Command+Shift+S',
        },
        description: 'Toggle sidebar',
      },
      'close-sidebar': {
        suggested_key: {
          default: 'Ctrl+Shift+W',
          mac: 'Command+Shift+W',
        },
        description: 'Close sidebar',
      },
    },
  },
})
