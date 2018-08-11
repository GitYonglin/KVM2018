import { N2F } from '../utils/toFixed';

export const manualState = ['待机', '张拉中', '卸荷中', '回程中', '保压'];
export const autoState = ['待机', '张拉中', '卸荷中', '回程中', '保压', '卸荷完成', '补压', '压力确认', '回顶', '回顶完成'];
export const liveState = ['初张拉', '阶段一', '阶段二', '阶段三', '终张拉', '超张拉', '卸荷', '回程'];
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
  id: string;
  stage: number;
  time: number[];
  mode: number;
  mpa: RecordMode;
  mm: RecordMode;
  cvsData: CvsData;
  liveMpaCvs: LiveCvs[];
  liveMmCvs: LiveCvs[];
  returnStart: ReturnStart;
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

interface ReturnStartItem {
  mpa: number;
  mm: number;
}
interface ReturnStart {
  a1?: ReturnStartItem;
  a2?: ReturnStartItem;
  b1?: ReturnStartItem;
  b2?: ReturnStartItem;
}

export interface SumData {
  a1?: SumItem;
  a2?: SumItem;
  b1?: SumItem;
  b2?: SumItem;
}
interface SumItem {
  mm: number;
  sum?: number;
  deviation?: number;
}
// 伸长量 = 100% - 10% + %20 - 10% - 内缩值 - 工作端伸长量
// 偏差率 = (总伸长量 - 理论伸长量) / 理论伸长量 * 100
export function funcSumData(mm, task): SumData {
  const r: SumData = {};
  const mode = [];
  // tslint:disable-next-line:forin
  for (const name in mm) {
    mode.push(name);
    const m = mm[name];
    r[name] = {};
    // workMm: 1, retractionMm: 2, theoryMm: 3
    r[name].mm = N2F(m[m.length - 1] - m[0] + (m[1] - m[0]) - task[name].workMm - task[name].retractionMm);
  }
  if (mode.length === 1) {
    if (mode.indexOf('a1') !== -1) {
      r.a1.sum = N2F(r.a1.mm);
      r.a1.deviation = N2F(((r.a1.sum - task.a1.theoryMm) / task.a1.theoryMm) * 100);
    } else {
      r.b1.sum = N2F(r.b1.mm);
      r.b1.deviation = N2F(((r.b1.sum - task.b1.theoryMm) / task.b1.theoryMm) * 100);
    }
  } else {
    if (mode.indexOf('a1') !== -1) {
      r.a1.sum = N2F(r.a1.mm + r.a2.mm);
      r.a1.deviation = N2F(((r.a1.sum - task.a1.theoryMm) / task.a1.theoryMm) * 100);
    }
    if (mode.indexOf('b1') !== -1) {
      r.b1.sum = N2F(r.b1.mm + r.b2.mm);
      r.b1.deviation = N2F(((r.b1.sum - task.b1.theoryMm) / task.b1.theoryMm) * 100);
    }
  }
  return r;
}
// (终位移 - 回油位移) - (1 - 初张拉压力 / 终张拉压力) / 工作端伸长量
export function funcRetraction (d: RecordData, task) {
  const r = {};
  // tslint:disable-next-line:forin
  for (const name in d.mm) {
    const length = d.mpa[name].length - 1;
    console.log('力筋回缩量', length, d.mm[name][length], d.returnStart[name].mm, d.mpa[name][0], d.mpa[name][length], task[name].workMm);
    r[name] = N2F((d.mm[name][length] - d.returnStart[name].mm) - (1 - d.mpa[name][0] / d.mpa[name][length]) / task[name].workMm);
  }
  return r;
}
