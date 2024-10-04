export function getTimeUnitText(timeUnit: string): string {
  switch (timeUnit) {
    case 'year':
      return '年';
    case 'month':
      return '月';
    case 'week':
      return '周';
    case 'day':
      return '日';
    default:
      return '年';
  }
}