export function getCurrencySymbol(currency: string): string {
  const symbolMap: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CHF: 'Fr',
    CAD: 'C$',
    AUD: 'A$',
    CNY: '￥',
    INR: '₹',
    RUB: '₽',
    BRL: 'R$',
    ZAR: 'R',
    MXN: 'MX$',
    SGD: 'S$',
    HKD: 'HK$',
    NZD: 'NZ$',
    KRW: '₩',
  };
  return symbolMap[currency] || '?';
}
