export function objectToString(obj: Record<string, any>): string {
  const maxLength = 20;
  let entries = Object.entries(obj).map(([key, value]) => {
    // 使用 JSON.stringify 来处理复杂类型的值
    return `${key}: ${JSON.stringify(value)}`;
  });
  let resultString = entries.join('; ');
  resultString = resultString.replace(/"/g, '');
  // 如果结果字符串超过最大长度，则截断并添加省略号
  if (resultString.length > maxLength) {
    resultString = resultString.substring(0, maxLength) + '...';
  }

  return resultString;
}