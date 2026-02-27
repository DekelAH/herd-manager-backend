export function formatTagNumber(num: string | number, gender: 'male' | 'female'): string {
  const prefix = gender === 'female' ? 'F' : 'M'
  return `${prefix}${String(num).padStart(4, '0')}`
}
