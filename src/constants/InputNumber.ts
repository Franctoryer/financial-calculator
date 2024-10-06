export const parseCurrency =  (input: string) => {
  const nums = input.replace(/(,|¥|\s)/g, '').trim()
  if (/^-?\d+(\.(\d+)?)?$/.test(nums))
    return Number(nums)
  return nums === '' ? null : Number.NaN
}

export const formatCurrency = (value: number | null) => {
  if (value === null)
    return ''
  return `${value.toLocaleString('en-US')}`
}