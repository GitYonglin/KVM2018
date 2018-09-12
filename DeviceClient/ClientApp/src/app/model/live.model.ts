import { N2F } from '../utils/toFixed';
import { deviceModes } from './device.model';
import { PLCLive } from '../utils/PLC8Show';
import { HoleGroup } from './task.model';
import { Record } from './record.model';

export const manualState = ['待机', '张拉中', '卸荷中', '回程中', '保压'];

export const liveState = ['初张拉', '阶段一', '阶段二', '阶段三', '终张拉', '超张拉', '卸荷', '回程'];

export interface Dev {
  a1?: PLCLive;
  a2?: PLCLive;
  b1?: PLCLive;
  b2?: PLCLive;
}
export interface ShowValues {
  a1: ShowValuesItem;
  a2: ShowValuesItem;
  b1: ShowValuesItem;
  b2: ShowValuesItem;
}
interface ShowValuesItem {
  plcMpa: number;
  mpa: number;
  mm: number;
  alarmNumber: number;
  alarm: string[];
  state: string;
  setPLCMpa: number;
  affirmMm: number;
  affirmMm0: number;
}

export interface RecordData {
  id: string;
  state: number;
  stage: number;
  time: number[];
  mode: number;
  mpa: RecordMode;
  mm: RecordMode;
  cvsData: CvsData;
  returnStart: ReturnStart;
}
interface RecordMode {
  a1?: number[];
  a2?: number[];
  b1?: number[];
  b2?: number[];
}
export interface CvsData {
  mark?: {
    index: number[];
    doc: string[];
  };
  time?: any[];
  mpa?: RecordMode;
  mm?: RecordMode;
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
  /** 单顶位移 */
  mm?: number;
  /** 总伸长量 */
  sum?: number;
  /** 总偏差率 */
  deviation?: number;
  /** 单顶偏差值 */
  sub?: number;
}
// 伸长量 = 100% - 10% + %20 - 10% - 内缩值 - 工作端伸长量
// 偏差率 = (总伸长量 - 理论伸长量) / 理论伸长量 * 100
/**
 * 伸长量/偏差率
 *
 * @export
 * @param {RecordMode} mm 记录位移数据
 * @param {HoleGroup} task 任务数据
 * @param {number} [stage=1] 当前张拉阶段
 * @returns {SumData}
 */
export function funcSumData(mm: RecordMode, task: HoleGroup, stage: number = 0): SumData {
  const r: SumData = {};
  const mode = [];
  // tslint:disable-next-line:forin
  for (const name in mm) {
    if (mm[name]) {
      mode.push(name);
      const m = mm[name];
      r[name] = {};
      if (stage === 0) {
        stage = m.length - 1;
      }
      // workMm: 1, retractionMm: 2, theoryMm: 3
      r[name].mm = N2F(m[stage] - m[0] + (m[1] - m[0]) - task[name].workMm - task[name].retractionMm);
      // console.log('实时数据计算', mm, m[m.length - 1], m[1], m[0]);
    }
  }
  if (mode.length === 1) {
    if (mode.indexOf('a1') !== -1) {
      r.a1.sum = N2F(r.a1.mm);
      r.a1.deviation = N2F(((r.a1.sum - task.a1.theoryMm) / task.a1.theoryMm) * 100);
      r.a1.sub = task.a1.theoryMm - r.a1.sum;
    } else {
      r.b1.sum = N2F(r.b1.mm);
      r.b1.deviation = N2F(((r.b1.sum - task.b1.theoryMm) / task.b1.theoryMm) * 100);
      r.b1.sub = task.b1.theoryMm - r.b1.sum;
    }
  } else {
    if (mode.indexOf('a1') !== -1) {
      r.a1.sum = N2F(r.a1.mm + r.a2.mm);
      r.a1.deviation = N2F(((r.a1.sum - task.a1.theoryMm) / task.a1.theoryMm) * 100);
      r.a1.sub = task.a1.theoryMm - r.a1.sum;
    }
    if (mode.indexOf('b1') !== -1) {
      r.b1.sum = N2F(r.b1.mm + r.b2.mm);
      r.b1.deviation = N2F(((r.b1.sum - task.b1.theoryMm) / task.b1.theoryMm) * 100);
      r.b1.sub = task.b1.theoryMm - r.b1.sum;
    }
  }
  return r;
}
// (终位移 - 回油位移) - (1 - 初张拉压力 / 终张拉压力) / 工作端伸长量
/**
 * 力筋回缩量计算
 *
 * @export
 * @param {RecordData} d 记录数据
 * @param {HoleGroup} task 任务数据
 * @returns
 */
export function funcRetraction (d: Record, task: HoleGroup): any {
  const r = {};
  for (const name of deviceModes[task.mode]) {
    const length = d.mpa[name].length - 1;
    console.log('力筋回缩量', length, d.mm[name][length], d.returnStart[name].mm, d.mpa[name][0], d.mpa[name][length], task[name].workMm);
    r[name] = N2F((d.mm[name][length] - d.returnStart[name].mm) - (1 - d.mpa[name][0] / d.mpa[name][length]) / task[name].workMm);
  }
  return r;
}

export const runTensionData = {
  state: false,
  stage: 0,
  delayState: false,
  stateOk: false,
  LodOffTime: 0,
  nowLodOffTime: 0,
  loadOffDelayState: false,
  returnState: false,
  returnTime: 0,
  mmBalanceControl: 0,
  stopState: false,
};

