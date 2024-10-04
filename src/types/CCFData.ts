export interface CCFRowDataRaw {
  order: number,
  cash: number,
  freq: number
}

export interface CCFRowData {
  date: string,
  cash: number,
  freq: number
}