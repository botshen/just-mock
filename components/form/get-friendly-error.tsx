const map: Record<string, string> = {
  'is invalid': '格式不正确',
}
export function getFriendlyError(error?: string, fallback = '　') {
  return error ? map[error] : fallback
}
