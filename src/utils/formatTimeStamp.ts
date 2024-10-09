export function formatTimestamp(timestamp: number): string {
  const now = new Date().getTime();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  const day = new Date(timestamp).getUTCDate();
  const today = new Date().getUTCDate();

  switch (true) {
    case minutes < 1:
      return '刚刚';
    case minutes < 60:
      return `${minutes}分钟前`;
    case hours < 24:
      return `${hours}小时前`;
    case days < 2:
      switch (true) {
        case day === today - 1:
          return '昨天';
        case day === today - 2:
          return '前天';
        default:
          return '1天前';
      }
    case days < 7:
      return `${days}天前`;
    default:
      return new Date(timestamp).toISOString().split('T')[0]; // 输出 yyyy-mm-dd 格式
  }
}