import { nanoid } from 'nanoid'
// id, uuid, nanoid
import { v4 as uuid } from 'uuid'

let id = 0
export function createId(): number {
  id += 1
  return id
}

export function createStringId(prefix = ''): string {
  return prefix + createId()
}

export function createUuid(prefix = ''): string {
  return prefix + uuid()
}

export function createNanoId(prefix = ''): string {
  return prefix + nanoid()
}
