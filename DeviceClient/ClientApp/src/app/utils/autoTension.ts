import { Record, RecordMode, ReturnStart } from '../model/record.model';
import { HoleGroup } from '../model/task.model';
import { deviceModes } from '../model/device.model';
import { PLCLive } from './PLC8Show';
import { Dev, SumData } from '../model/live.model';
import { Observable, observable } from 'rxjs';

export interface AutoControlModel {
  maximumDeviationRate: number;
  LowerDeviationRate: number;
  mpaDeviation: number;
  mmBalanceControl: number;
  mmGoBack: number;
  loadOffTime: number;
}
export interface AutoState {
  /** 阶段 */
  stage: number;
  /** 自检 */
  self: boolean;
  /** 自检错误 */
  selfError: boolean;
  /** 运行 */
  run: boolean;
  /** 保压 */
  pm: boolean;
  /** 保压完成 */
  pmDone: boolean;
  /** 张拉完成 */
  tensionDone: boolean;
  /** 卸荷 */
  loadOffState: boolean;
  /** 卸荷完成 */
  loadOffDone: boolean;
  /** 回程 */
  returnState: boolean;
  /** 超位移 */
  superWorkMm: boolean;
  /** 倒顶回程 */
  goBack: boolean;
  /** 倒顶完成 */
  goBackDone: boolean;
  /** 确认压力 */
  affirmMpa: boolean;
  /** 确认压力完成 */
  affirmMpaDone: boolean;
  /** 确认压力位移 */
  affirmMm: ModeData;
  /** 原始位移记录 */
  originalMm: ModeData;
  /** 中断张拉 */
  break: boolean;
  /** 卸荷用时 */
  loadOffTime: number;
  /** 平衡状态 */
  balance: boolean;
  /** 张拉暂停 */
  pause: boolean;
  /** 暂停完成 */
  pauseDone: boolean;
  /** 报警解除 */
  alarmLift: boolean;
  /** 超伸长量 */
  maximumDeviationRate: boolean;
}
export interface AutoData {
  /** 张拉组合 */
  modeStr: string[];
  /** 阶段数据 */
  stageSrt: string[];
  /** 阶段压力PLC值 */
  PLCMpa: PLCMpa;
  /** 阶段压力Mpa值 */
  mpa: PLCMpa;
  /** 阶段控制Kn */
  kn: string[];
  /** 保压时间 */
  time: number[];
  /** 允许最大偏差率 */
  maximumDeviationRate: number;
  /** 允许最小偏差率 */
  LowerDeviationRate: number;
  /**  允许压力差 */
  mpaDeviation: number;
  /** 张拉平衡 */
  mmBalanceControl: number;
  /** 回顶位移下限 */
  mmGoBack: number;
  /** 卸荷延时 */
  loadOffTime: number;
  /** 确认压力PLC值 */
  affirmMpa: ModeData;
}
interface KMData {
  kn: string[];
  mpa: {
    a1?: string[];
    a2?: string[];
    b1?: string[];
    b2?: string[];
  };
}
export interface AutoControlData {
  task: HoleGroup;
  record: Record;
  data: AutoData;
  state: AutoState;
  sumData: SumData;
  KMData: KMData;
}
interface PLCMpa {
  a1?: number[];
  a2?: number[];
  b1?: number[];
  b2?: number[];
}

interface ModeData {
  a1?: number;
  a2?: number;
  b1?: number;
  b2?: number;
}

export class GetAutoData {
  public task: HoleGroup;
  public record: Record;
  public state: AutoState;
  public data: AutoData;
  public sumData: SumData;
  public autoData: AutoControlData;
  public KMData: KMData;

  private Dev: Dev;

  constructor(task: HoleGroup, record: Record, kMData: KMData, dev: Dev, data0: AutoData = null) {
    this.Dev = dev;
    this.KMData = kMData;
    this.task = task;
    this.record = record;
    const control: AutoControlModel = JSON.parse(localStorage.getItem('AutoControl'));
    const modeStr = deviceModes[task.mode];

    const arrData = this.getPLCMpa(modeStr);
    const getSumDdata = this.getSumData(modeStr);
    const stage = this.getStageStr();
    this.data = {
      modeStr: modeStr,
      stageSrt: stage.stageStr,
      PLCMpa: arrData.plcMpa,
      mpa: arrData.mpa,
      kn: this.KMData.kn,
      time: this.task.time,
      maximumDeviationRate: data0 ? data0.maximumDeviationRate : control.maximumDeviationRate,
      LowerDeviationRate: data0 ? data0.LowerDeviationRate : control.LowerDeviationRate,
      mpaDeviation: data0 ? data0.mpaDeviation : control.mpaDeviation,
      mmBalanceControl: data0 ? data0.mmBalanceControl : control.mmBalanceControl,
      mmGoBack: data0 ? data0.mmGoBack : control.mmGoBack,
      loadOffTime: Number(data0 ? data0.loadOffTime : control.loadOffTime),
      affirmMpa: arrData.affirmMpa,
    };
    this.state = {
      stage: this.record ? this.record.stage : 0,
      self: false,
      selfError: false,
      run: false,
      pm: false,
      pmDone: false,
      tensionDone: false,
      loadOffState: false,
      loadOffDone: false,
      returnState: false,
      superWorkMm: false,
      goBack: false,
      goBackDone: false,
      affirmMpa: !record ? false : true,
      affirmMpaDone: false,
      affirmMm: {
        a1: 0,
        a2: 0,
        b1: 0,
        b2: 0,
      },
      originalMm: getSumDdata.originalMm,
      break: false,
      loadOffTime: 0,
      balance: false,
      pause: false,
      pauseDone: false,
      alarmLift: false,
      maximumDeviationRate: false,
    };
    this.sumData = getSumDdata.sumData,
    this.autoData = {
      task: this.task,
      record: this.record,
      data: this.data,
      state: this.state,
      sumData: this.sumData,
      KMData: this.KMData,
    };
    if (!record) {
      const recordItem = this.getRecordArr(modeStr);
      this.record = {
        id: task.id,
        parentId: task.parentId,
        operatorId: JSON.parse(sessionStorage.getItem('user')).id,
        stage: 0,
        state: 0,
        time: new Array(task.time.length).fill(0),
        mode: 0,
        mpa: recordItem.arr,
        mm: recordItem.arr,
        cvsData: {
          time: [],
          mpa: recordItem.cvsData,
          mm: recordItem.cvsData,
          mark: {
            index: [],
            doc: []
          },
        },
        returnStart: recordItem.returnStart
      };
    }
  }
  /**
   * 获取张拉阶段
   *
   * @param {HoleGroup} task 任务数据
   * @param {Record} record 记录数据
   * @returns
   * @memberof Auto
   */
  getStageStr(): {stageStr: string[], stage: number} {
    const task = this.task;
    const record = this.record;
    let stageSrt = ['初张拉', '阶段一', '阶段二', '阶段三', '终张拉'];
    console.log('二次张拉选择', task.twice, !record);
    if (task.twice && record) {
      if (record.state === 4) {
        return {stageStr: ['初张拉', '阶段一', '阶段二'], stage: 2};
      } else if (record.state === 2) {
        this.record.time[2] = 0;
      }
    }
    if (task.twice && !record) {
      return {stageStr: ['初张拉', '阶段一', '阶段二'], stage: 2};
    }
    switch (Number(task.tensionStage)) {
      case 3:
        stageSrt = ['初张拉', '阶段一', '终张拉'];
        break;
      case 4:
        stageSrt = ['初张拉', '阶段一', '阶段二', '终张拉'];
        break;
      case 5:
        stageSrt = ['初张拉', '阶段一', '阶段二', '阶段三', '终张拉'];
        break;
      default:
        break;
    }
    if (task.super) {
      stageSrt.push('超张拉');
    }
    return {stageStr: stageSrt, stage: stageSrt.length - 1};
  }
  /**
   *获取PLCMpa值
   *
   * @memberof Auto
   */
  getPLCMpa(modeStr): { plcMpa: PLCMpa, mpa: PLCMpa, affirmMpa: any } {
    const kMData = this.KMData;
    const plcMpa: PLCMpa = {
      a1: [],
      a2: [],
      b1: [],
      b2: [],
    };
    const mpa: PLCMpa = {
      a1: [],
      a2: [],
      b1: [],
      b2: [],
    };
    const affirmMpa = {
      a1: 0,
      a2: 0,
      b1: 0,
      b2: 0,
    };
    modeStr.forEach(name => {
      kMData.mpa[name].forEach(value => {
        console.log(value);
        const m = Number(value);
        const PLCmpa = this.Dev[name].Mpa2PLC(m);
        plcMpa[name].push(PLCmpa);
        mpa[name].push(m);
      });
      if (this.record) {
        affirmMpa[name] = this.Dev[name].Mpa2PLC(this.record.mpa[name][this.record.stage]);
      }
    });
    return { plcMpa: plcMpa, mpa: mpa, affirmMpa: affirmMpa };
  }
  /** 记录数据初始化 */
  getRecordArr(modeStr) {
    const arr: RecordMode = {};
    const returnStart: ReturnStart = {};
    const cvsData: RecordMode = {};
    modeStr.forEach(name => {
      arr[name] = new Array(this.task.time.length).fill(0);
      returnStart[name] = {
        mpa: 0,
        mm: 0,
      };
      cvsData[name] = [];
    });
    return { arr: arr, returnStart: returnStart, cvsData: cvsData };
  }
  /** 伸长量计算初始化 */
  getSumData(modeStr) {
    const sumData: SumData = {};
    const originalMm = {
      a1: 0,
      a2: 0,
      b1: 0,
      b2: 0,
    };
    modeStr.forEach(name => {
      sumData[name] = {
        mm: null,
        sum: null,
        deviation: null,
        sub: null,
      };
      if (this.record) {
        originalMm[name] = this.record.mm[name][this.record.stage];
      }
    });
    return {sumData: sumData, originalMm: originalMm};
  }
}

export class AutoControl {
  data: AutoControlData;
  constructor(data: AutoControlData) {
    this.data = {
      task: data.task,
      record: data.record,
      data: data.data,
      state: data.state,
      sumData: data.sumData,
      KMData: data.KMData,
    };
  }
}
