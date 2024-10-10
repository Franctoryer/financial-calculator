export function standardTimeStamp (timestamp: number) {
  // 将时间戳转换为Date对象
  const date = new Date(timestamp);

  // 获取年、月、日、时、分、秒
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以加1
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  // 组合成标准时间字符串
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}