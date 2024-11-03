// id, uuid, nanoid
import { v4 as uuid } from 'uuid'
import { nanoid } from 'nanoid'

let id = 0
export const createId = (): number => {
  id += 1
  return id
}

export const createStringId = (prefix = ''): string => {
  return prefix + createId()
}

export const createUuid = (prefix = ''): string => {
  return prefix + uuid()
}

export const createNanoId = (prefix = ''): string => {
  return prefix + nanoid()
}
