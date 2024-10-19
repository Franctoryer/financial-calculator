import type { HistoryData } from '@/types/HistoryData';
import type { HistoryDataView } from '@/types/HistoryDataView';

export const getHistoryByTag = (historyData: HistoryData[], tag: string): HistoryDataView[] => {
  if (tag === 'all') {
    let resultData = [] as HistoryDataView[];
    let index = 0;
    for (const history of historyData) {
      let resultElement: HistoryDataView = {
        index: index,
        saveTime: history.saveTime,
        name: history.name,
        inputData: history.inputData,
        resultData: history.resultData
      }
      resultData.push(resultElement);
      index++;
    }
    return resultData;
  }
  let resultData = [] as HistoryDataView[];
  let index: number = 0;
  for (const history of historyData) {
    if (history.name === tag) {
      let resultElement: HistoryDataView = {
        index: index,
        saveTime: history.saveTime,
        name: history.name,
        inputData: history.inputData,
        resultData: history.resultData
      }
      resultData.push(resultElement);
    }
    index++;
  }
  return resultData;
}