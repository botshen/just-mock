export function tryParseJson<T>(data: string, defaultValue: T) {
  try {
    return JSON.parse(data) as T
  }
  catch (e) {
    return defaultValue
  }
}
