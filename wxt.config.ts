import path, { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vueJsx from '@vitejs/plugin-vue-jsx'

import { defineConfig } from 'wxt'
// @ts-expect-error 这是 JS 文件
import type { ViteSvgIconsPlugin } from './svg-icons-plugin/svg-icons-plugin'
// @ts-expect-error 这是 JS 文件
import { createSvgIconsPlugin } from './svg-icons-plugin/svg-icons-plugin'

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
      createSvgIconsPlugin(svgIconPluginParams()),
      createSvgIconsPlugin(svgIconPluginParams({
        registerName: 'virtual:svg-icons-colored',
        iconDirs: [path.resolve(process.cwd(), '@/assets/icons-colored')],
        symbolId: '[name]-colored',
        customDomId: '__svg__icons__colored__',
        svgoOptions: false,
      })),
    ],
    resolve: {
      alias: {
        '@': projectPath('/'),
      },
    },
  }),
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
function svgIconPluginParams(attrs?: Partial<ViteSvgIconsPlugin>): ViteSvgIconsPlugin {
  return {
    registerName: 'virtual:svg-icons',
    iconDirs: [path.resolve(process.cwd(), '@/assets/icons')],
    symbolId: '[name]',
    svgoOptions: {
      plugins: [
        {
          name: 'removeAttrs',
          params: {
            attrs: ['fill', 'stroke', 'style'],
            preserveCurrentColor: true,
          },
        },
      ],
    },
    customDomId: '__svg__icons__',
    ...attrs,
  }
}
