import { Injectable, Inject } from '@angular/core';
import { HubConnectionBuilder, HubConnection } from '@aspnet/signalr';
import { DeviceParameter, ConversionName, DeviceItemName } from '../model/DeviceParameter';
import { PLC2Value, PLC100ms2s, Value2PLC, PLCM } from '../utils/PLC8Show';
import { APIService } from './api.service';
import { ShowValues, autoState, RecordData, SumData, funcSumData } from '../model/live.model';
import { Observable } from 'rxjs';
import { newFormData } from '../utils/form/constructor-FormData';

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
  public nowDevice: any = null;
  public deviceParameter: DeviceParameter = null;
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
  public runTensionData = {
    state: false,
    stage: 0,
    delayState: false,
    stateOk: false,
    LodOffTime: 0,
    nowLodOffTime: 0,
    loadOffDelayState: false,
    returnState: false,
    returnTime: 5,
    mmBalanceControl: 0,
    stopState: false,
  };
  public tensionData: any;
  public recordData: RecordData;
  // 实时数据
  public showValues: ShowValues = {
    a1: {
      plcMpa: 0,
      mpa: 0,
      mm: 0,
      alarmNumber: 0,
      alarm: [],
      state: autoState[0]
    },
    b1: {
      plcMpa: 0,
      mpa: 0,
      mm: 0,
      alarmNumber: 0,
      alarm: [],
      state: autoState[0]
    },
    a2: {
      plcMpa: 0,
      mpa: 0,
      mm: 0,
      alarmNumber: 0,
      alarm: [],
      state: autoState[0]
    },
    b2: {
      plcMpa: 0,
      mpa: 0,
      mm: 0,
      alarmNumber: 0,
      alarm: [],
      state: autoState[0]
    },
  };
  public liveSum: SumData;
  public liveState: any;

  constructor(
    @Inject('BASE_CONFIG') private config,
    private _service: APIService,
  ) { }

  public PLC2Value(PLCValue, name: string, key: string) {
    return this.conversionValue(PLCValue, name, key, true);
  }
  public Value2PLC(value, name: string, key: string) {
    return this.conversionValue(value, name, key, false);
  }
  private conversionValue(value, name, key, state) {
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
  // 链接后台socket
  public creation() {
    try {
      const connection = new HubConnectionBuilder().withUrl('/PLC').build();
      connection.start().then(r => {
        // this.setDevice();
        connection.invoke('Init');
        console.log('MS请求');
        // 获取设备参数
        connection.invoke('GetDeviceParameter');
        console.log('MS请求');
        // 监听连接状态
        connection.on('Send', data => {
          // console.log(data);
          if (data.id === '主站') {
            this.deviceLinkZ = data.message;
            this.state.a1 = false;
            this.state.b1 = false;
          } else {
            this.deviceLinkC = data.message;
            this.state.a2 = false;
            this.state.b2 = false;
          }
          this.commError();
        });
        // 监听获取实时数据
        connection.on('LiveData', rData => {
          if (rData.name === '主站') {
            // console.log('主站LIVE', rData.data);
            this.deviceLinkZ = '设备链接正常';
            this.state.a1 = true;
            this.state.b1 = true;
            if (this.nowDevice !== null && this.deviceParameter !== null) {
              this.setShowValue(rData.data, 1);
            }

            // console.log(this.showValues);
          } else {
            this.deviceLinkC = '设备链接正常';
            this.state.a2 = true;
            this.state.b2 = true;
            if (this.nowDevice !== null && this.deviceParameter !== null) {
              this.setShowValue(rData.data, 2);
            }
            // console.log('从站LIVE', rData.data);
          }
        });
        // 监听保压延时
        connection.on('Delay', data => {
          this.recordData.time[this.recordData.stage] = data;
          console.log('延时', data);
        });
        // 监听保压完成
        connection.on('DelayOk', data => {
          console.log('延时完成', this.recordData.stage, this.tensionData.checkData.time.length - 1);
          this.recordData.time[this.recordData.stage] = data;
          if (this.recordData.stage < this.tensionData.checkData.time.length - 1) {
            this.recordData.stage ++;
            this.upPLC();
            this.runTensionData.delayState = false;
          } else {
            this.runTensionData.stateOk = true;
            this.autoLoadOff();
          }
        });
        // 监听卸荷延时
        connection.on('LoadOffDelay', data => {
          this.runTensionData.nowLodOffTime = data;
          console.log('卸荷延时', data);
        });
        // 监听保压完成
        connection.on('LoadOffDelayOk', data => {
          console.log('卸荷延时完成');
          // tslint:disable-next-line:forin
          for (const name in this.recordData.mm) {
            this.recordData.returnStart[name] = {mpa: this.showValues[name].mpa, mm: this.showValues[name].mm};
          }
          this.saveRecordDb();
          this.autoReturn();
        });
        // 监听获取plc设置
        connection.on('DeviceParameter', rData => {
          if (rData.name === '主站') {
            console.log('监听获取plc设置', rData.data);
            this.setDeviceParameterValue(rData.data);
          } else {
            console.log('从站', rData.data);
          }
        });
        // 暂停继续
        // connection.on('Stop2Run', d => {
        //   console.log('暂停继续');
        //   this.runTensionData.stopState = false;
        //   this.stopRunState = true;
        // });
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
    this.connection.invoke('F05', {id: id, address: address, F05: data});
    console.log('MS请求');
  }
  // 设置单个寄存器
  public F06(id: number, address: number, data: any) {
    this.connection.invoke('F06', {id: id, address: address, F06: data});
    console.log('MS请求');
  }
  // 设备参数设置
  public SetDeviceParameter(address: number, value: number, callback: Function = null) {
    this.connection.invoke('SetDeviceParameter', { address: address, value: value}).then( r => {
      console.log('MS请求');
      callback(r);
    });
  }
  // 同时获取
  public DF03(address: number, data: number) {
    try {
      this.connection.invoke('DF03', {address: address, F03: data});
      console.log('MS请求');
    } catch (error) {
      console.log('设备未连接不能操作');
    }
  }
  // 同时设置线圈
  public DF05(address: number, state: boolean) {
    try {
      this.connection.invoke('DF05', {address: address, F05: state});
      console.log('MS请求');
    } catch (error) {
      console.log('设备未连接不能操作');
    }
  }
  // 设备参数获取
  public setDeviceParameterValue(data) {
    const sensorMpa = data[14] / data[15] || 0;
    const sensorMm = data[14] / data[16] || 0;
    this.deviceParameter = {
      dataArr: data,
      mpaUpperLimit: PLC2Value(data[0], sensorMpa),
      returnMpa: PLC2Value(data[1], sensorMpa),
      settingMpa: PLC2Value(data[2], sensorMpa),
      oilPumpDelay: PLC100ms2s(data[3]),
      mmUpperLimit: PLC2Value(data[4], sensorMm),
      mmLowerLimit: PLC2Value(data[5], sensorMm),
      mmWorkUpperLimit: PLC2Value(data[6], sensorMm),
      mmWorkLowerLimit: PLC2Value(data[7], sensorMm),
      maximumDeviationRate: data[8],
      LowerDeviationRate: data[9],
      mpaDeviation: PLC2Value(data[10], sensorMpa),
      mmBalanceControl: PLC2Value(data[11], sensorMm),
      mmReturnLowerLimit: PLC2Value(data[12], sensorMm),
      unloadingDelay: PLC100ms2s(data[13]),
      simulationValue: data[14],
      mpaSensorUpperLimit: data[15],
      mmSensorUpperLimit: data[16],
      mpaCoefficient: sensorMpa,
      mmCoefficient: sensorMm
    };
    // localStorage.setItem('DeviceParameter', JSON.stringify(deviceParameter));
    console.log('设备参数', this.deviceParameter);
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
    this.showValues[`a${i}`].plcMpa = data[0];
    this.showValues[`b${i}`].plcMpa = data[2];
    this.showValues[`a${i}`].mpa = this.PLC2Value(data[0], 'mpa', `a${i}`);
    this.showValues[`a${i}`].mm = this.PLC2Value(data[1], 'mm', `a${i}`);
    this.showValues[`b${i}`].mpa = this.PLC2Value(data[2], 'mpa', `b${i}`);
    this.showValues[`b${i}`].mm = this.PLC2Value(data[3], 'mm', `b${i}`);
    this.showValues[`a${i}`].alarmNumber = data[4];
    this.showValues[`b${i}`].alarmNumber = data[5];
    this.showValues[`a${i}`].alarm = this.setAlarm(data[4].toString(2).padStart(6, '0'));
    this.showValues[`b${i}`].alarm = this.setAlarm(data[5].toString(2).padStart(6, '0'));
    this.showValues[`a${i}`].state = autoState[data[6]];
    this.showValues[`b${i}`].state = autoState[data[7]];
    if (this.runTensionData.state) {
      this.autoMonitoring();
      if (!this.runTensionData.stateOk) {
        this.saveRecord();
      }
    }
    // console.log(this.showValues, data[5].toString(2).padStart(6, '0'), data[5]);
  }

  // 报警实时数据转换
  private setAlarm(value) {
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

  // 获取设备
  public setDevice(callback: Function = null) {
    const deviceId = localStorage.getItem('nowDevice');
    console.log('获取设备', deviceId);
    this._service.get(`/device/${deviceId}`).subscribe(r => {
      this.nowDevice = r;
      console.log('获取设备', r, this.nowDevice);
      if (callback) {
        callback(true);
      }
    });
  }
  // 上传自动张拉数据
  public upPLC() {
    let data = null;
    const t = this.tensionData;
    const index = this.recordData.stage;
    if (t.mode === 0) {
      data = {mode: t.mode, a1: t.mpaPLC.a1[index]};
    }
    if (t.mode === 1) {
      data = {mode: t.mode, a1: t.mpaPLC.a1[index], a2: t.mpaPLC.a1[index]};
    }
    if (t.mode === 2) {
      data = {mode: t.mode, b1: t.mpaPLC.b1[index]};
    }
    if (t.mode === 3) {
      data = {mode: t.mode, b1: t.mpaPLC.b1[index], b2: t.mpaPLC.b2[index]};
    }
    if (t.mode === 4) {
      data = {mode: t.mode,
        a1: t.mpaPLC.a1[index], a2: t.mpaPLC.a1[index],
        b1: t.mpaPLC.b1[index], b2: t.mpaPLC.b2[index]
      };
    }
    console.log('下载数据到PLC', t, index, data, this.tensionData.checkData.time[this.runTensionData.stage]);
    this.connection.invoke('Tension', data);
    console.log('MS请求');
  }
  // 实时保存张拉数据
  private saveRecord() {
    const modes = this.tensionData.modes;
    const sumData = {};
    modes.forEach(name => {
      this.recordData.mpa[name][this.recordData.stage] = this.showValues[name].mpa;
      this.recordData.mm[name][this.recordData.stage] = this.showValues[name].mm;
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
      for (const name of this.tensionData.modes) {
        if (!this.runTensionData.stateOk && this.showValues[name].plcMpa >= this.tensionData.mpaPLC[name][this.recordData.stage]) {
          delay = true;
          by = true;
        } else {
          delay = false;
        }
        if (this.showValues[name].state === '卸荷完成') {
          loadOff = true;
        } else {
          loadOff = false;
        }
        if (this.showValues[name].state === '张拉暂停') {
          stop = true;
        }
        // console.log(this.showValues[name].state, name);
      }
      if (stop) {
        this.runTensionData.stopState = true;
      } else {
        this.runTensionData.stopState = false;
      }
      // 张拉平衡
      this.balanceControl(by);
      // 进入保压
      if (delay && !this.runTensionData.delayState) {
          console.log('进入保压计时', this.tensionData.checkData.time[this.recordData.stage]);
          this.runTensionData.delayState = true;
          this.connection.invoke('Delay', this.tensionData.checkData.time[this.recordData.stage]);
          console.log('MS请求');
      }
    // 进入卸荷延时
    if (loadOff && !this.runTensionData.loadOffDelayState) {
      this.connection.invoke('LoadOffDelay', this.runTensionData.LodOffTime);
      console.log('MS请求');
      this.runTensionData.loadOffDelayState = true;
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

      if (this.tensionData.mode === 2) {
        if (this.tensionData.modes.indexOf('a1') !== -1) {
          this.balanceControl2('a', by);
        } else {
          this.balanceControl2('b', by);
        }
      } else {
        this.balanceControl4(by);
      }
    }
  }
  // 两顶平衡
  balanceControl2(name, by) {
    const v = this.showValues;
    const x1 = this.liveSum[`${name}2`].mm;
    const x2 = this.liveSum[`${name}1`].mm;
    const b = this.runTensionData.mmBalanceControl;
    const x1b = x1 + Number(b);
    const x2b = x2 + Number(b);

    const x1State = v[`${name}2`].state === '平衡暂停';
    const x2State = v[`${name}2`].state === '平衡暂停';

    const address = name === 'a' ? PLCM(43) : PLCM(53);

    if (!by && (x1 > x2b) && !x1State) {
      this.F05(1, address, true);
    } else if (x1State && (x1 < x2) && by) {
      this.F05(1, address, false);
    }
    if (!by && (x2 > x1b) && !x2State) {
      this.F05(2, address, true);
    } else if (x2State && (x2 < x1) && by) {
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
    } else if (a1State && (a1 < a2 || a1 < b1 || a1 < b2) || by) {
      this.F05(1, PLCM(43), false);
    }
    if (!by && (a2 > a1b || a2 > b1b || a2 > b2b) && !a2State) {
      this.F05(2, PLCM(43), true);
    } else if (a2State && (a2 < a1 || a2 < b1 || a2 < b2) || by) {
      this.F05(2, PLCM(43), false);
    }
    if (!by && (b1 > a1b || b1 > a2b || b1 > b2b) && !b1State) {
      this.F05(1, PLCM(53), true);
    } else if (b1State && (b1 < a1 || b1 < a2 || b1 < b2) || by) {
      this.F05(1, PLCM(53), false);
    }
    if (!by && (b2 > a1b || b2 > a2b || b2 > b1b) && !b2State) {
      this.F05(2, PLCM(53), true);
    } else if (b2State && (b2 < a1 || b2 < a2 || b2 < b1) || by) {
      this.F05(2, PLCM(53), false);
    }
  }
  // 自动卸荷
  autoLoadOff() {
    console.log('卸荷');
    this.connection.invoke('AutoF05', { mode: this.tensionData.mode, address: 521, F05: true});
    console.log('MS请求');

  }
  // 自动回程
  autoReturn() {
    // this.runTensionData.state = false;
    console.log('进入回程');
    this.connection.invoke('AutoF05', { mode: this.tensionData.mode, address: 522, F05: true});
    console.log('MS请求');
  }
  // 张拉完成自动跳转上一个页面
  returnTime() {
    setTimeout(() => {
      this.runTensionData.returnTime -- ;
      if (this.runTensionData.returnTime === 0) {
        this.runTensionData = {
          state: false,
          stage: 0,
          delayState: false,
          stateOk: false,
          LodOffTime: 0,
          nowLodOffTime: 0,
          loadOffDelayState: false,
          returnState: false,
          returnTime: 5,
          mmBalanceControl: 0,
          stopState: false,
        };
        history.go(-1);
      }
      if (this.runTensionData.returnState) {
        this.returnTime();
      }
    }, 1000);
  }
  // 保存数据到数据库
  saveRecordDb() {
    console.log('数据保存');
    delete this.recordData .liveMmCvs;
    delete this.recordData .liveMpaCvs;
    this.recordData.state = 1;
    console.log('张拉记录数据', this.recordData);
    localStorage.setItem('recordData', JSON.stringify(this.recordData));
    const message = { success: '记录保存', error: '' };
    this._service.http('post', this.recordData, '/record', message).subscribe(b => {
      console.log('返回数据', b);
      this.runTensionData.returnState = true;
      this.returnTime();
      this.connection.invoke('AutoOk');
      this.liveSum = null;
      console.log('MS请求');
    });
  }
  private anew() {
    setTimeout(() => {
      this.creation();
    }, 5000);
  }
}
