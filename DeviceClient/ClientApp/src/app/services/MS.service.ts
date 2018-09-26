import { Injectable, Inject } from '@angular/core';
import { HubConnectionBuilder, HubConnection } from '@aspnet/signalr';
import { DeviceParameter, ConversionName, DeviceItemName } from '../model/DeviceParameter';
import { PLC2Value, PLC100ms2s, Value2PLC, PLCM, PLCLive, setDeviceParameterValue } from '../utils/PLC8Show';
import { APIService } from './api.service';
import { ShowValues, SumData, funcSumData, runTensionData, Dev } from '../model/live.model';
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

  public Dev: Dev;
  public modeNo: string;
  public connectNo: string;
  public getDeviceParameterEvent = null;
  public liveMonitoringEvent = null;
  public plcT = 'plc耗时';


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
      // const connection = new HubConnectionBuilder().withUrl('/DVP').build();
      connection.start().then(r => {
        // this.setDevice();
        console.log('连接', new Date().getTime());
        connection.invoke('Init').then(() => {
          this._service.showMessage('success', '后台连接成功！');
          connection.invoke('Creates', localStorage.getItem('connect') === '2');
        });
        console.log('MS请求');
        // 获取设备参数
        // connection.invoke('GetDeviceParameter');
        console.log('MS请求');
        // 监听连接状态
        connection.on('Send', data => {
          console.log(data);
          const modes = data.id === '主站' ? ['a1', 'b1'] : ['a2', 'b2'];
          this.deviceItemNames.map(name => {
            if (this.Dev[name]) {
              this.Dev[name].connectError(data.message);
            }
          });

        });
        // 监听获取实时数据
        connection.on('LiveData', rData => {
          const modes = rData.id === 1 ? ['a1', 'b1'] : ['a2', 'b2'];
          const data = rData.data;
          modes.map(name => {
            if (this.Dev[name]) {
              if (name.indexOf('a') > -1) {
                this.Dev[name].liveDataFunc([data[0], data[1], data[4], data[6], data[8]]);
              } else {
                this.Dev[name].liveDataFunc([data[2], data[3], data[5], data[7], data[9]]);
              }
            }
            if (this.liveMonitoringEvent) {
              document.dispatchEvent(this.liveMonitoringEvent); // 触发监听事件
            }
          });
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
          }
          if (rData.c) {
            this.deviceParameterC = setDeviceParameterValue(rData.c);
          }
          if (this.getDeviceParameterEvent) {
            document.dispatchEvent(this.getDeviceParameterEvent);
          }
        });
        /** 通信耗时 */
        connection.on('PLCTime', rt => {
          console.log(rt);
          this.plcT = rt;
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

  // 后台连接
  private anew() {
    setTimeout(() => {
      this.creation();
    }, 5000);
  }
  // // 张拉过程记录
  // private recordMarkSave(doc: string) {
  //   this.recordData.cvsData.mark.doc.push(doc);
  //   this.recordData.cvsData.mark.index.push(this.recordData.cvsData.time.length);
  // }
}
