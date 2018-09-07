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
  /** 倒顶回程 */
  goBack: boolean;
  /** 倒顶完成 */
  ogBackDone: boolean;
  /** 确认压力 */
  affirmMpa: boolean;
  /** 确认压力完成 */
  affirmMpaDone: boolean;
  /** 中断张拉 */
  break: boolean;
  /** 卸荷用时 */
  loadOffTime: number;
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
}
export interface AutoControlData {
  task: HoleGroup;
  record: Record;
  data: AutoData;
  state: AutoState;
  sumData: SumData;
}
interface PLCMpa {
  a1?: number[];
  a2?: number[];
  b1?: number[];
  b2?: number[];
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

export class GetAutoData {
  public task: HoleGroup;
  public record: Record;
  public state: AutoState;
  public data: AutoData;
  public sumData: SumData;
  public autoData: AutoControlData;

  private KMData: KMData;
  private Dev: Dev;

  constructor(task: HoleGroup, record: Record, kMData: KMData, dev: Dev) {
    this.Dev = dev;
    this.KMData = kMData;
    this.task = task;
    const control: AutoControlModel = JSON.parse(localStorage.getItem('AutoControl'));
    const modeStr = deviceModes[task.mode];
    if (record) {
      this.record = record;
    } else {
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
    const arrData = this.getPLCMpa(modeStr);
    this.data = {
      modeStr: modeStr,
      stageSrt: this.getStageStr(),
      PLCMpa: arrData.plcMpa,
      mpa: arrData.mpa,
      kn: this.KMData.kn,
      time: this.task.time,
      maximumDeviationRate: control.maximumDeviationRate,
      LowerDeviationRate: control.LowerDeviationRate,
      mpaDeviation: control.mpaDeviation,
      mmBalanceControl: control.mmBalanceControl,
      mmGoBack: control.mmGoBack,
      loadOffTime: Number(control.loadOffTime),
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
      goBack: false,
      ogBackDone: false,
      affirmMpa: false,
      affirmMpaDone: false,
      break: false,
      loadOffTime: 0
    };
    this.sumData = this.getSumData(modeStr);
    this.autoData = {
      task: this.task,
      record: this.record,
      data: this.data,
      state: this.state,
      sumData: this.sumData
    };
  }
  /**
   * 获取张拉阶段
   *
   * @param {HoleGroup} task 任务数据
   * @param {Record} record 记录数据
   * @returns
   * @memberof Auto
   */
  getStageStr(): string[] {
    const task = this.task;
    const record = this.record;
    let stageSrt = ['初张拉', '阶段一', '阶段二', '阶段三', '终张拉'];
    if (task.twice && record) {
      if (record.state === 4) {
        return ['初张拉', '阶段一', '阶段二'];
      }
    } else if (task.twice && record) {
      return ['初张拉', '阶段一', '阶段二'];
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
    return stageSrt;
  }
  /**
   *获取PLCMpa值
   *
   * @memberof Auto
   */
  getPLCMpa(modeStr): { plcMpa: PLCMpa, mpa: PLCMpa } {
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
    modeStr.forEach(name => {
      kMData.mpa[name].forEach(value => {
        console.log(value);
        const m = Number(value);
        const PLCmpa = this.Dev[name].Mpa2PLC(m);
        plcMpa[name].push(PLCmpa);
        mpa[name].push(m);
      });
    });
    return { plcMpa: plcMpa, mpa: mpa };
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
  getSumData(modeStr) {
    const sumData: SumData = {};
    modeStr.forEach(name => {
      sumData[name] = {
        mm: null,
        sum: null,
        deviation: null,
        sub: null,
      };
    });
    return sumData;
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
      sumData: data.sumData
    };
  }
}
