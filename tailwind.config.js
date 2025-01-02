/** @type {import('tailwindcss').Config} */
import daisy from 'daisyui'
import plugin from 'tailwindcss/plugin'

const breakpoints = {
  // 手机
  phone: { min: 0, max: 719 },
  // 平板
  pad: { min: 720, max: 1079 },
  // 电脑
  pc: { min: 1080, max: 1919 },
  // 宽屏电脑
  wide: { min: 1920, max: 2879 },
  // 超宽屏电脑
  xwide: { min: 2880, max: Infinity },
}

export default {
  content: [
    './entrypoints/popup/index.html',
    './entrypoints/popup/**/*.{vue,js,ts,jsx,tsx}',
    './entrypoints/sidepanel/index.html',
    './entrypoints/sidepanel/**/*.{vue,js,ts,jsx,tsx}',
    './components/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      pad: `${breakpoints.pad.min}px`,
      pc: `${breakpoints.pc.min}px`,
      wide: `${breakpoints.wide.min}px`,
      xwide: `${breakpoints.xwide.min}px`,
      sm: '720px',
      md: '1080px',
      lg: '1440px',
      xl: '2160px',
    },
    extend: {
      zIndex: {
        // 局部
        'up': '1',
        'up-up': '2',
        // 全局
        'chat-window': '50',
        'top-nav': '128',
        'tooltip': '256',
        'dialog': '512',
        'tooltip-in-dialog': String(512 + 256),
        'message': '20',
        'message-in-dialog': String(512 + 128),
      },
      colors: {
        primary: '#666',
        subtitle: 'var(--subtitle-color)',
        danger: 'var(--danger-color)',
        gray: {
          DEFAULT: 'var(--gray-color)',
        },
      },
      placeholderColor: {
        primary: '#999',
        secondary: '#666',
        danger: 'red',
      },
      maxWidth: {
        page: 'var(--page-max-width)',
      },
      width: {
        sidebar: 'var(--sidebar-width)',
        select: 'var(--select-width)',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
      },
      textShadow: {
        sm: '0 1px 2px var(--tw-shadow-color)',
        DEFAULT: '0 2px 4px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)',
      },
      keyframes: {
        loading: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      // 添加隐藏滚动条的工具类
      utilities: {
        '.hide-scrollbar': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Chrome, Safari and Opera */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      },
    },
  },
  plugins: [
    daisy,
    plugin(({ addUtilities, matchUtilities, theme }) => {
      // 添加隐藏滚动条的工具类
      addUtilities({
        '.hide-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })

      matchUtilities(
        {
          'text-shadow': value => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') },
      )
      matchUtilities(
        {
          'grid-areas': value => ({
            'grid-template-areas': value,
          }),
          'grid-in': value => ({
            'grid-area': value,
          }),
        },
      )
    }),
    require('@tailwindcss/typography'),
  ],
  daisyui: {
    themes: ['light'],
    darkTheme: 'light',
  },
}
