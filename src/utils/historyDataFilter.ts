import type { HistoryData } from '@/types/HistoryData';

export const getHistoryByTag = (historyData: HistoryData[], tag: string) => {
  if (tag === 'all') {
    return historyData;
  }
  let resultData = [] as HistoryData[];
  for (const history of historyData) {
    if (history.name === tag) {
      resultData.push(history);
    }
  }

  return resultData;
}