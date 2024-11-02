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
});
