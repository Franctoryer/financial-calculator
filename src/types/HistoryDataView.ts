export interface HistoryDataView {
  index: number,  // 记录索引位置
  saveTime: number, // 历史记录的保存时间
  name: string,     // 路由名称
  inputData: any,   // 输入数据
  resultData: any   // 结果数据
}