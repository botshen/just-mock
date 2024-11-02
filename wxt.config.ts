import { defineConfig } from 'wxt';
import vueJsx from '@vitejs/plugin-vue-jsx'
// See https://wxt.dev/api/config.html
const isCustomElement = (x: string) => x.startsWith('x-')

export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-vue'],
  vite: () => ({
    plugins: [
       vueJsx({ transformOn: true,
        mergeProps: true,
        enableObjectSlots: true,
        isCustomElement,
        defineComponentName: ['defineComponent', 'createComponent'],
      }),
    ],
  }),
  manifest: {
    side_panel: {
      default_path: 'entrypoints/sidepanel/index.html',
    },
    action: {},
    name : "just-mock",
    description: "A browser extension for mocking data in the sidebar.",
    version: '0.0.1',
    permissions: [
      'sidePanel',
    ],   
  },
});
