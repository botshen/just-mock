// utils/storage.ts
import { storage } from '@wxt-dev/storage'

export const totalSwitch = storage.defineItem<boolean>(
  'local:totalSwitch',
  {
    fallback: true,
  },
)

export const interceptSuccessToBackend = storage.defineItem<boolean>(
  'local:interceptSuccessToBackend',
  {
    fallback: false,
  },
)

export const consoleLog = storage.defineItem<boolean>(
  'local:consoleLog',
  {
    fallback: true,
  },
)

export const interceptSuccessTip = storage.defineItem<boolean>(
  'local:interceptSuccessTip',
  {
    fallback: true,
  },
)
