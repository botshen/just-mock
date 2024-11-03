export type AddOnPrefix<S extends string> = `on${Capitalize<S>}`
export type Emits2Events<T> = {
  [K in keyof T as AddOnPrefix<string & K>]?: T[K]
}
export type JsonSimpleValue = string | number | boolean | null | undefined
export interface JsonObject { [key: string]: JsonValue }
export type JsonArray = JsonValue[]
export type JsonValue = JsonSimpleValue | JsonObject | JsonArray

export type ClassName = string | string[] | object | null | false | undefined | 0
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {}
