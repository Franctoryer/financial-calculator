// 判断字符串是否可以转化为分数（小数部分不能超过5位）
export function canConvertToFraction(str: string) {
  // 移除多余的尾部 '0'
  let trimmedStr = str.replace(/\.?0+$/, '');

  // 如果是整数，直接返回 true
  if (!trimmedStr.includes('.')) {
    return false;
  }

  // 获取小数部分并检查长度
  let decimalPart = trimmedStr.split('.')[1];
  return decimalPart.length <= 5;
}

// 将小数字符串转换为分数
export function convertToFraction(str: string) {
  // 处理整数部分
  let [integerPart, decimalPart = ''] = str.split('.');

  // 如果没有小数部分，直接返回整数
  if (!decimalPart) {
    return integerPart;
  }

  // 获取小数部分的长度
  let decimalLength = decimalPart.length;

  // 分子：将整个数当做整数处理
  let numerator = parseInt(integerPart + decimalPart, 10);

  // 分母：10 的幂次方，依照小数部分的长度
  let denominator = Math.pow(10, decimalLength);

  // 化简分子和分母
  let gcdValue = gcd(numerator, denominator);

  numerator /= gcdValue;
  denominator /= gcdValue;

  // 如果有整数部分，将其合并到分数中
  return `${numerator}/${denominator}`;
}

// 最大公约数（用于化简分数）
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}