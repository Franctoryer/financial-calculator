export function objectToString(obj: Record<string, any>): string {
  let entries = Object.entries(obj).map(([key, value]) => {
    // 使用 JSON.stringify 来处理复杂类型的值
    return `"${key}": ${JSON.stringify(value)}`;
  });
  let resultString = entries.join('; ');
  return resultString;
}