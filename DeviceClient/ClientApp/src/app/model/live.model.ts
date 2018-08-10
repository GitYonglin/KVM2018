export const manualState = ['待机', '张拉中', '卸荷中', '回程中', '保压'];
export const autoState = ['待机', '张拉中', '卸荷中', '回程中', '保压', '卸荷完成', '补压', '压力确认', '回顶', '回顶完成'];
export interface ShowValues {
  a1: ShowValuesItem;
  a2: ShowValuesItem;
  b1: ShowValuesItem;
  b2: ShowValuesItem;
}
interface ShowValuesItem {
  mpa: number;
  mm: number;
  alarmNumber: number;
  alarm: string[];
  state: string;
}

export interface RecordData {
  stage: number;
  time: number[];
  mode: number;
  mpa: RecordMode;
  mm: RecordMode;
  cvsData: CvsData;
  liveMpaCvs: LiveCvs[];
  liveMmCvs: LiveCvs[];
}
interface RecordMode {
  a1?: number[];
  a2?: number[];
  b1?: number[];
  b2?: number[];
}
export interface CvsData {
  timeState: any;
  timeEnd: any;
  skep: number;
  mpa: RecordMode;
  mm: RecordMode;
}
interface LiveCvs {
  time: any;
  type: any;
  value: number;
}
