import { N2F } from '../utils/toFixed';
import { deviceModes } from './device.model';

export const manualState = ['待机', '张拉中', '卸荷中', '回程中', '保压'];
export const autoState = ['待机', '张拉中', '卸荷中', '回程中', '保压', '卸荷完成', '补压', '压力确认', '回顶', '回顶完成', '平衡暂停',
                          '压力确认完成', '自检完成', '自检错误', '14', '15', '16', '17', '18', '19',
                          '张拉暂停', '超工作位移上限', '回顶完成'
];
export const liveState = ['初张拉', '阶段一', '阶段二', '阶段三', '终张拉', '超张拉', '卸荷', '回程'];
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
  time: any[];
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
  sub?: number;
}
// 伸长量 = 100% - 10% + %20 - 10% - 内缩值 - 工作端伸长量
// 偏差率 = (总伸长量 - 理论伸长量) / 理论伸长量 * 100
export function funcSumData(mm, task, stage = 0): SumData {
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
export function funcRetraction (d: RecordData, task) {
  const r = {};
  for (const name of deviceModes[d.mode]) {
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

export const showValues: ShowValues = {
  a1: {
    plcMpa: 0,
    mpa: 0,
    mm: 0,
    alarmNumber: 0,
    alarm: [],
    state: autoState[0],
    setPLCMpa: 0,
    affirmMm: 0,
    affirmMm0: 0,
  },
  b1: {
    plcMpa: 0,
    mpa: 0,
    mm: 0,
    alarmNumber: 0,
    alarm: [],
    state: autoState[0],
    setPLCMpa: 0,
    affirmMm: 0,
    affirmMm0: 0,
  },
  a2: {
    plcMpa: 0,
    mpa: 0,
    mm: 0,
    alarmNumber: 0,
    alarm: [],
    state: autoState[0],
    setPLCMpa: 0,
    affirmMm: 0,
    affirmMm0: 0,
  },
  b2: {
    plcMpa: 0,
    mpa: 0,
    mm: 0,
    alarmNumber: 0,
    alarm: [],
    state: autoState[0],
    setPLCMpa: 0,
    affirmMm: 0,
    affirmMm0: 0,
  },
};
