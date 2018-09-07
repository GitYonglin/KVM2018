import { Injectable, Inject } from '@angular/core';
import { HubConnectionBuilder, HubConnection } from '@aspnet/signalr';
import { DeviceParameter, ConversionName, DeviceItemName } from '../model/DeviceParameter';
import { PLC2Value, PLC100ms2s, Value2PLC, PLCM, PLCLive, setDeviceParameterValue } from '../utils/PLC8Show';
import { APIService } from './api.service';
import { ShowValues, autoState, SumData, funcSumData, runTensionData, Dev } from '../model/live.model';
import { Observable } from 'rxjs';
import { newFormData } from '../utils/form/constructor-FormData';
import { N2F } from '../utils/toFixed';
import { Record } from '../model/record.model';
import { Device } from '../model/device.model';

interface InPLC {
  Id: number;
  Address: number;
  F05: boolean;
  F01: number;
  F06: number;
}

const alarmArr = ['压力未连接', '位移未连接', '位移下限', '位移上限', '超设置压力', '压力上限'];
@Injectable({ providedIn: 'root' })
export class MSService {
  public deviceItemNames = ['a1', 'a2', 'b1', 'b2'];
  public nowDevice: Device;
  public deviceParameter: DeviceParameter = null;
  public deviceParameterC: DeviceParameter = null;
  public connection: HubConnection;
  public deviceLinkZ = '主站未连接';
  public deviceLinkC = '从站未连接';
  public cvsState = false;
  public state = {
    a1: false,
    b1: false,
    a2: false,
    b2: false,
  };
  public runTensionData = JSON.parse(JSON.stringify(runTensionData));
  public tensionData: any;
  public recordData: Record;
  // 实时数据
  public showValues: ShowValues = {
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
  // 实时计算位移偏差率
  public liveSum: SumData;
  // 当前张拉状态
  public liveState: any;
  public ExitTime = 5;
  public passSate = false;
  public returnMmOk = false;
  private autoVerifyMpaState = false;
  public mmReturnLowerLimit = 0;
  public autoVerifyLoadOff = false;
  public Dev: Dev;
  public modeNo: string;
  public connectNo: string;
  public GetDeviceParameterEvent: Function = function () { document.dispatchEvent(new Event('GetDeviceParameter')); };


  constructor(
    @Inject('BASE_CONFIG') private config,
    private _service: APIService,
  ) {
    this.Dev = {
      a1: null,
      a2: null,
      b1: null,
      b2: null,
    };
    this.newPLCLive();
  }
  // 设备模式切换
  public newPLCLive() {
    const connect = localStorage.getItem('connect');
    const mode = this.deviceParameter ? this.deviceParameter.modeRadio : '2';
    this.connectNo = connect;
    this.modeNo = mode;

    if (connect === '1') {
      this.deviceParameterC = null;
      this.deviceItemNames = ['a1'];
      if (mode === '2') {
        this.deviceItemNames = ['a1', 'b1'];
      }
    } else if (connect === '2') {
      this.deviceItemNames = ['a1', 'a2'];
      if (mode === '2') {
        this.deviceItemNames = ['a1', 'a2', 'b1', 'b2'];
      }
    }
    this.deviceItemNames.map(name => {
      this.Dev[name] = new PLCLive();
    });
    this.deviceItemNames.map(name => {
      if (this.nowDevice) {
        this.Dev[name].deviceInit(this.nowDevice[name].correction);
      }
      if (this.deviceParameter && this.deviceParameter.mpaCoefficient && this.deviceParameter.mmCoefficient) {
        this.Dev[name].sensorInit(this.deviceParameter.mpaCoefficient, this.deviceParameter.mmCoefficient);
      }
    });
    // if (this.connection) {
    //   this.connection.invoke('GetDeviceParameter');
    // }
    console.log(this.deviceItemNames);
  }
  /**
   * PLC转显示值
   *
   * @param {number} PLCValue PLC值
   * @param {string} name 转换类型 'mpa'|'mm'
   * @param {string} key 设备名称 a1|a2|b1|b22
   * @returns 返回PLC值
   * @memberof MSService
   */
  public PLC2Value(PLCValue: number, name: string, key: string) {
    return this.conversionValue(PLCValue, name, key, true);
  }
  /**
   * 显示值转PLC值
   *
   * @param {number} value 显示值
   * @param {string} name 转换类型 'mpa'|'mm'
   * @param {string} key 设备名称 a1|a2|b1|b22
   * @returns 返回显示值
   * @memberof MSService
   */
  public Value2PLC(value: number, name: string, key: string) {
    return this.conversionValue(value, name, key, false);
  }

  /**
   * PLC值与显示值互转
   *
   * @private
   * @param {number} value 转换值
   * @param {string} name 转换类型 'mpa'|'mm'
   * @param {string} key 设备名称 a1|a2|b1|b22
   * @param {boolean} state PLC转显示值 = true，显示值转PLC值 = false
   * @returns 返回转换值
   * @memberof MSService
   */
  private conversionValue(value: number, name: string, key: string, state: boolean) {
    try {
      let correction = null;
      let MpaMm = 40;
      let sensor = this.deviceParameter.mmCoefficient;
      if (name === 'mpa') {
        MpaMm = 5;
        sensor = this.deviceParameter.mpaCoefficient;
        correction = this.nowDevice[key].correction.mpa;
      } else if (name === 'mm') {
        correction = this.nowDevice[key].correction.mm;
      }
      if (state) {
        return PLC2Value(value, sensor, MpaMm, correction);
      } else {
        return Value2PLC(value, sensor, MpaMm, correction);
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * 获取当前设备
   *
   * @param {Function} [callback=null] 成功返回设备回调
   * @memberof MSService
   */
  public setDevice(id: string = null, callback: Function = null) {
    const deviceId = id ? id : localStorage.getItem('nowDevice');
    console.log('获取设备', deviceId);
    try {
      this._service.get(`/device/${deviceId}`).subscribe(r => {
        this.nowDevice = r;
        if (this.nowDevice) {
          this.deviceItemNames.map(name => {
            this.Dev[name].deviceInit(this.nowDevice[name].correction);
          });
          localStorage.setItem('nowDevice', deviceId);
        }
        console.log('获取设备', r, this.nowDevice);
        const state = r || false;
        if (callback) {
          callback(state);
        }
      });
    } catch (error) {
    }
  }
  // 链接后台socket
  public creation() {
    try {
      const connection = new HubConnectionBuilder().withUrl('/PLC').build();
      connection.start().then(r => {
        // this.setDevice();
        connection.invoke('Init').then(() => {
          this._service.showMessage('success', '设备连接成功');
          connection.invoke('Creates', localStorage.getItem('connect') === '2');
        });
        console.log('MS请求');
        // 获取设备参数
        // connection.invoke('GetDeviceParameter');
        console.log('MS请求');
        // 监听连接状态
        connection.on('Send', data => {
          // console.log(data);
          const modes = data.id === '主站' ? ['a1', 'b1'] : ['a2', 'b2'];
          modes.map(name => {
            if (this.Dev[name]) {
              this.Dev[name].connectError(data.message);
            }
          });
          this.commError();
        });
        // 监听获取实时数据
        connection.on('LiveData', rData => {
          const modes = rData.name === '主站' ? ['a1', 'b1'] : ['a2', 'b2'];
          const data = rData.data;
          modes.map(name => {
            if (this.Dev[name]) {
              if (name.indexOf('a') > -1) {
                this.Dev[name].liveDataFunc([data[0], data[1], data[4], data[6], data[8]]);
              } else {
                this.Dev[name].liveDataFunc([data[2], data[3], data[5], data[7], data[9]]);
              }
            }
          });
        });
        // 监听保压延时
        connection.on('Delay', data => {
          this.recordData.time[this.recordData.stage] = data;
          console.log('延时', data);
        });
        // 监听保压完成
        connection.on('DelayOk', data => {
          console.log('延时完成', this.recordData.stage, this.tensionData.stage);
          this.recordData.time[this.recordData.stage] = data;
          this.recordMarkSave(`${this.liveState[this.recordData.stage]}·保压完成`);
          if (this.recordData.stage < this.tensionData.stage) {
            this.recordData.stage++;
            this.upPLC();
            this.runTensionData.delayState = false;
            this.recordMarkSave(`${this.liveState[this.recordData.stage]}·开始`);
          } else {
            this.runTensionData.stateOk = true;
            console.log('全部保压完成');
            this.autoLoadOff();
          }
        });
        // 监听卸荷延时
        connection.on('LoadOffDelay', data => {
          this.runTensionData.nowLodOffTime = data;
          console.log('卸荷延时', data);
        });
        // 监听卸荷完成
        connection.on('LoadOffDelayOk', data => {
          console.log('卸荷延时完成');
          // tslint:disable-next-line:forin
          for (const name in this.recordData.mm) {
            this.recordData.returnStart[name] = { mpa: this.showValues[name].mpa, mm: this.showValues[name].mm };
          }
          this.saveRecordDb();
          this.autoReturn();
        });
        // 监听获取plc设置
        connection.on('DeviceParameter', rData => {
          console.log('监听获取plc设置 ', rData);
          if (rData.z) {
            this.deviceParameter = setDeviceParameterValue(rData.z);
            if (this.deviceParameter.mpaCoefficient && this.deviceParameter.mmCoefficient) {
              this.deviceItemNames.map(name => {
                this.Dev[name].sensorInit(this.deviceParameter.mpaCoefficient, this.deviceParameter.mmCoefficient);
              });
            }
            this.newPLCLive();
            this.GetDeviceParameterEvent();
          }
          if (rData.c) {
            this.deviceParameterC = setDeviceParameterValue(rData.c);
            this.GetDeviceParameterEvent();
          }
        });

        this.connection = connection;
        console.log('链接成功', this.connection);
      }).catch((error) => {
        console.log('错误', error);
        this.anew();
      });
    } catch (error) {
      console.log(error);
      this.anew();
    }
    // this.connection.start()
    //   .then((r) => console.log('链接成功', this.connection.stop()))
    //   .catch((error) => console.log('链接失败', error)); 01 03 10 00 64 00 C8 00 0000000000000000000000C0
    // : 01 03 10 0064 00C8 0000 0000 0000 0000 0000 012C 93


  }
  // 设置单个线圈
  public F05(id: number, address: number, data: boolean) {
    this.connection.invoke('F05', { id: id, address: address, F05: data });
    console.log('MS请求');
  }
  // 设置单个寄存器
  public F06(id: number, address: number, data: any): Observable<boolean> {
    return new Observable((observer) => {
      this.connection.invoke('F06Async', { id: id, address: address, F06: data }).then((b) => {
        console.log('F06请求返回', b);
        observer.next(b);
      });
      console.log('MS请求');
    });
  }
  // 设备参数设置
  public SetDeviceParameter(address: number, value: number, callback: Function = null) {
    this.connection.invoke('SetDeviceParameterAsync', { address: address, value: value }).then(r => {
      console.log('MS请求');
      callback(r);
    });
  }
  // 同时获取
  public DF03(address: number, data: number) {
    try {
      this.connection.invoke('DF03', { address: address, F03: data });
      console.log('MS请求');
    } catch (error) {
      console.log('设备未连接不能操作');
    }
  }
  // 同时设置线圈
  public DF05(address: number, state: boolean) {
    try {
      this.connection.invoke('DF05', { address: address, F05: state });
      console.log('MS请求');
    } catch (error) {
      console.log('设备未连接不能操作');
    }
  }
  private commError() {
    console.log('通信中断', this.runTensionData.stage, this.state);
    if (this.runTensionData.stage) {
      for (const name of this.tensionData.modes) {
        if (this.state[name]) {
          this.runTensionData.stopState = true;
        }
      }
    }
  }
  // PLC实时数据
  private setShowValue(data, i) {
    // console.log('实时数据');
    this.showValues[`a${i}`].plcMpa = data[0];
    this.showValues[`a${i}`].mpa = this.PLC2Value(data[0], 'mpa', `a${i}`);
    this.showValues[`a${i}`].mm = this.PLC2Value(data[1], 'mm', `a${i}`);
    this.showValues[`a${i}`].alarmNumber = data[4];
    this.showValues[`a${i}`].alarm = this.setAlarm(data[4].toString(2).padStart(6, '0'));
    this.showValues[`a${i}`].state = autoState[data[6]];
    this.showValues[`a${i}`].setPLCMpa = data[8];

    this.showValues[`b${i}`].plcMpa = data[2];
    this.showValues[`b${i}`].mpa = this.PLC2Value(data[2], 'mpa', `b${i}`);
    this.showValues[`b${i}`].mm = this.PLC2Value(data[3], 'mm', `b${i}`);
    this.showValues[`b${i}`].alarmNumber = data[5];
    this.showValues[`b${i}`].alarm = this.setAlarm(data[5].toString(2).padStart(6, '0'));
    this.showValues[`b${i}`].state = autoState[data[7]];
    this.showValues[`b${i}`].setPLCMpa = data[9];
    if (!this.runTensionData.selfState) {
      // 自动张拉监控
      if (this.runTensionData.state) {
        this.autoMonitoring();
        if (!this.runTensionData.stateOk) {
          this.saveRecord();
          this.autoVerifyMpa();
        }
      }
      // 过位移监控
      if (this.passSate) {
        console.log('过位移监控');
        this.passMonitoring();
      }
      if (this.autoVerifyLoadOff) {
        this.autoLoadOffVerify();
      }
    } else {
      this.selfTest();
    }
    // console.log(this.showValues, data[5].toString(2).padStart(6, '0'), data[5]);
  }
  // 自检
  selfTest() {
    this.autoVerifyMpa();
    if (!this.runTensionData.selfState) {
      return;
    }
    for (const name of this.tensionData.modes) {
      if (this.showValues[name].state === '自检错误') {
        this.runTensionData.selfErrorState = true;
        return;
      }
      if (!(this.showValues[name].state === '自检完成')) {
        return;
      }
    }
    if (this.runTensionData.selfState) {
      this.recordMarkSave(`${this.liveState[this.recordData.stage]}·开始`);
    }
    this.runTensionData.selfState = false;
    document.dispatchEvent(new Event('testEvent'));
    console.log('自检完成！！！');
  }
  // 报警实时数据转换
  private setAlarm(value) {
    // console.log('实时数据');
    const arr = [];
    for (let index = 0; index < value.length; index++) {
      let alarm = '';
      if (value[index] === '1') {
        alarm = alarmArr[index];
      }
      arr.push(alarm);
    }
    return arr;
  }

  // PLC自动数据核对
  private autoVerifyMpa() {
    if (this.autoVerifyMpaState) {
      const index = this.recordData.stage;
      const mpa = this.tensionData.mpaPLC;
      for (const name of this.tensionData.modes) {
        console.log('核对数据', name, mpa[name][index], this.showValues[name].setPLCMpa);
        if ((name === 'a1' || name === 'b1' && this.state.a1) || (name === 'a2' || name === 'b2' && this.state.a2)) {
          if (mpa[name][index] !== this.showValues[name].setPLCMpa) {
            this.autoVerifyMpaState = false;
            this.upPLC();
            return;
          }
        }
      }
      this.autoVerifyMpaState = false;
    }
  }
  // 上传自动张拉数据
  public upPLC() {
    const t = this.tensionData;
    const index = this.recordData.stage;
    const data: {
      mode: number,
      a1?: number,
      a2?: number,
      b1?: number,
      b2?: number,
    } = {
      mode: t.mode,
      a1: 0,
      a2: 0,
      b1: 0,
      b2: 0
    };
    for (const name of t.modes) {
      data[name] = t.mpaPLC[name][index];
    }
    console.log('下载数据到PLC', data);
    this.connection.invoke('Tension', data).then(() => {
      this.autoVerifyMpaState = true;
    });
    console.log('MS请求');
  }
  // 确认压力数据下载
  public affirmMpaUpPLC() {
    const t = this.tensionData;
    const r = this.recordData;
    const index = this.recordData.stage;
    const data: {
      mode: number,
      a1?: number,
      a2?: number,
      b1?: number,
      b2?: number,
    } = {
      mode: t.mode,
      a1: 0,
      a2: 0,
      b1: 0,
      b2: 0
    };
    for (const name of this.tensionData.modes) {
      data[name] = this.Value2PLC(r.mpa[name][index], 'mpa', name);
      this.showValues[name].affirmMm0 = this.recordData.mm[name][index];
    }
    console.log('确认压力下载数据到PLC', data, this.showValues);
    this.connection.invoke('AffirmMpa', data).then(() => {
    });
    console.log('MS请求');
  }
  // 实时保存张拉数据
  private saveRecord() {
    const modes = this.tensionData.modes;
    const sumData = {};
    modes.forEach(name => {
      if (this.tensionData.repeatedly) {
        // console.log(name, this.showValues[name].affirmMm, this.showValues[name].mm,
        //   N2F(this.showValues[name].mm - this.showValues[name].affirmMm));
        if (this.showValues[name].affirmMm > 0) {
          this.recordData.mm[name][this.recordData.stage] = this.showValues[name].affirmMm0 +
            (N2F(this.showValues[name].mm - this.showValues[name].affirmMm));
          this.recordData.mpa[name][this.recordData.stage] = this.showValues[name].mpa;
        }
      } else {
        this.recordData.mpa[name][this.recordData.stage] = this.showValues[name].mpa;
        this.recordData.mm[name][this.recordData.stage] = this.showValues[name].mm;
      }
      sumData[name] = this.recordData.mm[name];
    });
    // 实时计算位移偏差率
    if (this.recordData.stage > 0) {
      this.liveSum = funcSumData(sumData, this.tensionData.taskSum, this.recordData.stage);
      // console.log('实时计算', this.liveSum);
    }
  }
  // 自动张拉监控
  private autoMonitoring() {
    let delay = false;
    let loadOff = false;
    let by = false;
    let stop = false;
    let balanceControlState = false;
    for (const name of this.tensionData.modes) {
      // 张拉平衡
      if (!this.tensionData.repeatedly || this.showValues[name].affirmMm > 0) {
        balanceControlState = true;
      }
      // 保压判断
      if (!this.runTensionData.stateOk &&
        this.showValues[name].plcMpa >= this.tensionData.mpaPLC[name][this.recordData.stage] &&
        (this.showValues[name].state === '保压' || this.showValues[name].state === '补压') &&
        !this.runTensionData.delayState
      ) {
        delay = true;
        by = true;
      } else {
        delay = false;
      }
      if (this.showValues[name].state === '卸荷完成' && !this.runTensionData.loadOffDelayState) {
        loadOff = true;
      } else {
        loadOff = false;
      }
      if (this.showValues[name].state === '张拉暂停') {
        stop = true;
      }
      if (this.showValues[name].state === '压力确认完成') {
        this.showValues[name].affirmMm = this.showValues[name].mm;
        console.log(name, this.showValues[name].affirmMm, '压力确认完成');
        let id = 1;
        let address = 414;
        const f06 = 0;
        if (name === 'a2') {
          id = 2;
        } else if (name === 'b1') {
          address = 415;
        } else if (name === 'b2') {
          id = 2;
          address = 415;
        }
        this.connection.invoke('F06', { id: id, address: address, F06: f06 });
      }
      if (this.showValues[name].state === '超工作位移上限') {
        this.returnMmOk = false;
        this.passSate = true;
        if (this.recordData.stage > 0) {
          for (const key of this.tensionData.modes) {
            if (this.liveSum[key].sub > 120) {
              this.mmReturnLowerLimit = 0;
            } else {
              this.mmReturnLowerLimit = 65;
              return;
            }
          }
        } else {
          this.mmReturnLowerLimit = 0;
        }
        return;
      }
      // console.log(this.showValues[name].state, name);
    }
    if (stop) {
      this.runTensionData.stopState = true;
    } else {
      this.runTensionData.stopState = false;
    }
    // 张拉平衡
    if (balanceControlState) {
      this.balanceControl(by);
    }
    // 进入保压
    if (delay) {
      console.log('进入保压计时', this.tensionData.checkData.time[this.recordData.stage]);
      this.runTensionData.delayState = true;
      this.connection.invoke('Delay', this.tensionData.checkData.time[this.recordData.stage]);
      console.log('MS请求');
      this.recordMarkSave(`${this.liveState[this.recordData.stage]}·保压`);
    }
    // 进入卸荷延时
    if (loadOff) {
      this.connection.invoke('LoadOffDelay', this.runTensionData.LodOffTime);
      console.log('MS请求');
      this.runTensionData.loadOffDelayState = true;
    }
  }
  // 回顶监控
  private passMonitoring() {
    for (const name of this.tensionData.modes) {
      if (this.showValues[name].state === '回顶完成') {
        this.returnMmOk = true;
      } else {
        this.returnMmOk = false;
        return;
      }
    }
  }
  // 平衡控制
  balanceControl(by) {
    if (!this.runTensionData.stateOk &&
      this.tensionData.modes.length > 1 &&
      this.runTensionData.mmBalanceControl > 0 &&
      this.recordData.stage > 0 &&
      this.liveSum &&
      !this.runTensionData.delayState &&
      !this.runTensionData.stopState) {

      if (this.tensionData.modes.length === 2) {
        if (this.tensionData.modes.indexOf('a1') !== -1) {
          this.balanceControl2('a', by);
        } else {
          this.balanceControl2('b', by);
        }
      } else if (this.tensionData.mode === 4) {
        this.balanceControl4(by);
      }
    }
  }
  // 两顶平衡
  balanceControl2(name, by) {
    const v = this.showValues;
    const x1 = this.liveSum[`${name}1`].mm;
    const x2 = this.liveSum[`${name}2`].mm;
    const b = this.runTensionData.mmBalanceControl;
    const x1b = x1 + Number(b);
    const x2b = x2 + Number(b);

    const x1State = v[`${name}1`].state === '平衡暂停';
    const x2State = v[`${name}2`].state === '平衡暂停';

    const address = name === 'a' ? PLCM(43) : PLCM(53);

    if (!by && (x1 > x2b) && !x1State) {
      this.F05(1, address, true);
    } else if (x1State && (x1 < x2) || by) {
      this.F05(1, address, false);
    }
    if (!by && (x2 > x1b) && !x2State) {
      this.F05(2, address, true);
    } else if (x2State && (x2 < x1) || by) {
      this.F05(2, address, false);
    }
  }
  // 四顶平衡
  balanceControl4(by) {
    const v = this.showValues;
    const a1 = this.liveSum.a1.mm;
    const a2 = this.liveSum.a2.mm;
    const b1 = this.liveSum.b1.mm;
    const b2 = this.liveSum.b2.mm;
    const b = this.runTensionData.mmBalanceControl;
    const a1b = a1 + Number(b);
    const a2b = a2 + Number(b);
    const b1b = b1 + Number(b);
    const b2b = b2 + Number(b);
    const a1State = v.a1.state === '平衡暂停';
    const a2State = v.a2.state === '平衡暂停';
    const b1State = v.b1.state === '平衡暂停';
    const b2State = v.b2.state === '平衡暂停';
    // console.log('张拉平衡', by, b, a1 > a2b || a1 > b1b
    // || a1 > b2b, a2 > a1b || a2 > b1b || a2 > b2b, b1 > a1b || b1 > a2b || b1 > b2b, b2 > a1b || b2 > a2b || b2 > b1b);
    if (!by && (a1 > a2b || a1 > b1b || a1 > b2b) && !a1State) {
      this.F05(1, PLCM(43), true);
      console.log('a1平衡');
    } else if (a1State && (a1 < a2 || a1 < b1 || a1 < b2) || by) {
      this.F05(1, PLCM(43), false);
      console.log('a1平衡1');
    }
    if (!by && (a2 > a1b || a2 > b1b || a2 > b2b) && !a2State) {
      this.F05(2, PLCM(43), true);
      console.log('a2平衡');
    } else if (a2State && (a2 < a1 || a2 < b1 || a2 < b2) || by) {
      this.F05(2, PLCM(43), false);
      console.log('a2平衡0');
    }
    if (!by && (b1 > a1b || b1 > a2b || b1 > b2b) && !b1State) {
      this.F05(1, PLCM(53), true);
      console.log('b1平衡');
    } else if (b1State && (b1 < a1 || b1 < a2 || b1 < b2) || by) {
      this.F05(1, PLCM(53), false);
      console.log('b1平衡0');
    }
    if (!by && (b2 > a1b || b2 > a2b || b2 > b1b) && !b2State) {
      this.F05(2, PLCM(53), true);
      console.log('b2平衡');
    } else if (b2State && (b2 < a1 || b2 < a2 || b2 < b1) || by) {
      this.F05(2, PLCM(53), false);
      console.log('b2平衡0');
    }
  }
  // 自动卸荷
  autoLoadOff() {
    console.log('卸荷');
    // this.connection.invoke('AutoF05', { mode: this.tensionData.mode, address: 521, F05: true });
    const mpa = {
      a1: 0,
      a2: 0,
      b1: 0,
      b2: 0,
    };
    for (const name of this.tensionData.modes) {
      mpa[name] = this.tensionData.mpaPLC[name][0];
    }
    this.connection.invoke('AutoLoadOff', mpa);
    console.log('卸荷MS请求');
    this.autoVerifyLoadOff = true;
  }
  // 卸荷确认
  autoLoadOffVerify() {
    this.autoVerifyLoadOff = false;
    const state = this.showValues;
    for (const name of this.tensionData.modes) {
      if ((name === 'a1' || name === 'b1' && this.state.a1) || (name === 'a2' || name === 'b2' && this.state.a2)) {
        if (state[name].state !== '卸荷中' && state[name].state !== '卸荷完成') {
          console.log('卸荷确认', state[name].state);
          this.autoLoadOff();
          return;
        }
      }
    }
  }
  // 自动回程
  autoReturn() {
    // this.runTensionData.state = false;
    console.log('进入回程');
    this.connection.invoke('AutoF05', { mode: this.tensionData.mode, address: 522, F05: true });
    console.log('MS请求');
  }
  // 张拉完成自动跳转上一个页面
  returnTime() {
    setTimeout(() => {
      this.ExitTime--;
      if (this.ExitTime === 0) {
        this.runTensionData.returnState = false;
        this.ExitTension();
        history.go(-1);
      }
      if (this.runTensionData.returnState) {
        this.returnTime();
      }
    }, 1000);
  }
  // 保存数据到数据库
  saveRecordDb(state = false, returnState = false) {
    console.log('数据保存', this.tensionData.twice, this.recordData.state);
    if (!state) {
      if (this.tensionData.twice && (this.recordData.state === 0 || this.recordData.state === 4)) {
        this.recordData.state = 2;
      } else {
        this.recordData.state = 1;
      }
    } else {
      if (this.tensionData.twice && (this.recordData.state === 0 || this.recordData.state === 4)) {
        this.recordData.state = 4;
      } else {
        this.recordData.state = 3;
      }
    }
    const httpType = this.tensionData.repeatedly ? 'put' : 'post';
    const url = this.tensionData.repeatedly ? `/record/${this.recordData.id}` : '/record';
    console.log('张拉记录数据', this.recordData);
    localStorage.setItem('recordData', JSON.stringify(this.recordData));
    const message = { success: '记录保存', error: '' };
    this._service.http(httpType, this.recordData, url, message).subscribe(b => {
      console.log('返回数据', b);
      if (!returnState) {
        if (state) {
          this.runTensionData.returnState = false;
          this.ExitTension();
        } else {
          this.ExitTime = 5;
          this.returnTime();
          this.runTensionData.returnState = true;
        }
      } else {
        this.passMmStop();
      }
    });
  }
  // 退出张拉
  public ExitTension() {
    this.runTensionData = JSON.parse(JSON.stringify(runTensionData)); // 初始化自动张拉数据
    this.liveSum = null;
    this.tensionData = null;
    this.recordData = null;
    this.connection.invoke('AutoOk');
    console.log('退出张拉');
  }
  // 回顶数据保存
  public passMmStop() {
    this.DF05(520, false);
    this.runTensionData = JSON.parse(JSON.stringify(runTensionData)); // 初始化自动张拉数据
    this.connection.invoke('AutoOk');
    this.DF05(560, true);
    if (this.recordData.stage > 0) {
      this.tensionData.repeatedly = true;
    }
    localStorage.setItem('TData', JSON.stringify(this.tensionData));
    localStorage.setItem('TResedData', JSON.stringify(this.recordData));
    console.log('退出张拉');
  }
  // 后台连接
  private anew() {
    setTimeout(() => {
      this.creation();
    }, 5000);
  }
  // 张拉过程记录
  private recordMarkSave(doc: string) {
    this.recordData.cvsData.mark.doc.push(doc);
    this.recordData.cvsData.mark.index.push(this.recordData.cvsData.time.length);
  }
}
