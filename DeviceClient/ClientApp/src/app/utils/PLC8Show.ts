import { Device, Correction } from '../model/device.model';
import { LiveData } from '../model/live';

/**
 * Mpa|Mm转换校正为PLC值
 *
 * @param {number} value 转换值Mpa|Mm
 * @param {number} sensor 传感器系数
 * @param {number} [MpaMm=5] 校正阶段 Mpa = 5， Mm = 40
 * @param {number[]} [correction=null] 校正数据
 * @returns {number} 返回PLC值
 */
export function Value2PLC(value: number, sensor: number, MpaMm: number = 5, correction: number[] = null): number {
  // return Math.round(value * sensor) || 0;
  const item = value * sensor;
  // console.log('88888888', correction, correction[Math.round(value / 40)]);
  if (correction === null) {
    return Math.round(item) || 0;
  } else {
    return Math.round((item / correction[Math.round(value / MpaMm)])) || 0;
  }
}
/**
 * PLC数据转换校正Mpa|Mm显示
 *
 * @param {number} PLCValue PLC值
 * @param {number} sensor 传感器系数
 * @param {number} [MpaMm=5] 校正阶段 Mpa = 5， Mm = 40
 * @param {number[]} [correction=null] 校正数据
 * @returns {number} 返回校正转换数据
 */
export function PLC2Value(PLCValue: number, sensor: number, MpaMm: number = 5, correction: number[] = null): number {
  const item = PLCValue / sensor;
  if (correction === null) {
    return Number(item.toFixed(2)) || 0;
  } else {
    return Number((item * correction[Math.round(item / MpaMm)]).toFixed(2)) || 0;
  }
}
export function PLC100ms2s(PLCValue: number): number {
  return Math.round(PLCValue / 10) || 0;
}
export function Value2PLC100ms(PLCValue: number): number {
  return Math.round(PLCValue * 10) || 0;
}

export function PLCM(address: number): number {
  return 2048 + address;
}
// 设备状态
const autoState = ['待机', '张拉中', '卸荷中', '回程中', '保压', '卸荷完成', '补压', '压力确认', '回顶', '回顶完成', '平衡暂停',
                          '压力确认完成', '自检完成', '自检错误', '14', '15', '16', '17', '18', '19',
                          '张拉暂停', '超工作位移上限', '回顶完成'
];
// 报警
const alarmArr = ['压力未连接', '位移未连接', '位移下限', '位移上限', '超设置压力', '压力上限'];

// 报警实时数据转换
function setAlarm(value) {
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

export class PLCLive {
  public liveData: LiveData = {
    plcMpa: NaN,
    mpa: NaN,
    mm: NaN,
    alarmNumber: NaN,
    alarm: [],
    state: undefined,
    setPLCMpa: NaN,
    connectState: false,
    connectMsg: '设备未连接'
  };
  private correction: Correction;
  private sensorMpa: number;
  private sensorMm: number;
  readonly mpaPace = 5;
  readonly mmPace = 40;

  constructor() {
  }
  public deviceInit(correction: Correction) {
    this.correction = correction;
    console.log(this.correction);
  }
  public sensorInit(sensorMpa: number, sensorMm: number) {
    this.sensorMm = sensorMm;
    this.sensorMpa = sensorMpa;
    console.log(this.sensorMm, this.sensorMpa);
  }
  /**
   * PLC值转mm
   *
   * @param {number} value PLC值
   * @param {string} name 转换的设备名称 a1|a2|b1|b2
   * @memberof PLC4Value
   */
  public PLC2Mm(value: number): number {
    return PLC2Value(value, this.sensorMm, this.mmPace, this.correction.mm);
  }
  /**
   * PLC值转mpa
   *
   * @param {number} value PLC值
   * @param {string} name 转换的设备名称 a1|a2|b1|b2
   * @memberof PLC4Value
   */
  public PLC2Mpa(value: number): number {
    return PLC2Value(value, this.sensorMpa, this.mpaPace, this.correction.mpa);
  }
  private PLC2Value(value: number, sensor: number, MpaMm, correction: number[]): number {
    const item = value / sensor;
    // console.log(value, sensor, MpaMm, correction, item, Math.round(item / MpaMm));
    if (correction === null) {
      return Number(item.toFixed(2)) || 0;
    } else {
      return Number((item * correction[Math.round(item / MpaMm)]).toFixed(2)) || 0;
    }
  }

  /**
   * mm转PLC值
   *
   * @param {number} value mm值
   * @memberof PLC4Value
   */
  public Mm2PLC(value: number): number {
    return Value2PLC(value, this.sensorMm, this.mmPace, this.correction.mm);
  }
  /**
   * Mpa值转PLC值
   *
   * @param {number} value Mpa值
   * @memberof PLC4Value
   */
  public Mpa2PLC(value: number): number {
    return Value2PLC(value, this.sensorMpa, this.mpaPace, this.correction.mpa);
  }
  Value2PLC(value: number, sensor: number, MpaMm, correction: number[]): number {
    const item = value * sensor;
    if (correction === null) {
      return Math.round(item) || 0;
    } else {
      return Math.round((item / correction[Math.round(value / MpaMm)])) || 0;
    }
  }

  public liveDataFunc(data: Array<number>) {
    // console.log(this.correction, this.sensorMm, this.sensorMpa, this.liveData);
    // console.log(data);
    if (this.correction && this.sensorMm && this.sensorMpa) {
      this.liveData =  {
        plcMpa: data[0],
        mpa: this.PLC2Mpa(data[0]),
        mm: this.PLC2Mm(data[1]),
        alarmNumber: data[2],
        alarm: setAlarm(data[2].toString(2).padStart(6, '0')),
        state: autoState[data[3]],
        setPLCMpa: data[4],
        connectState: true,
        connectMsg: '连接正常'
      };
    } else {
      let msg = '请选择设备';
      if (!this.sensorMpa || !this.sensorMpa) {
        msg = '设备参数错误';
      }
      this.liveData.connectMsg = msg;
    }
  }
  public connectError(msg: string) {
    this.liveData.connectState = false;
    this.liveData.connectMsg = msg;
  }
}

 // 设备参数数据转换
export function setDeviceParameterValue(data) {
  const sensorMpa = data[14] / data[15] || 0;
  const sensorMm = data[14] / data[16] || 0;
  return {
    dataArr: data,
    mpaUpperLimit: PLC2Value(data[0], sensorMpa),
    returnMpa: PLC2Value(data[1], sensorMpa),
    settingMpa: PLC2Value(data[2], sensorMpa),
    oilPumpDelay: PLC100ms2s(data[3]),
    mmUpperLimit: PLC2Value(data[4], sensorMm),
    mmLowerLimit: PLC2Value(data[5], sensorMm),
    mmWorkUpperLimit: PLC2Value(data[6], sensorMm),
    mmWorkLowerLimit: PLC2Value(data[7], sensorMm),
    modeRadio: data[8].toString(),
    mpaCoefficient: sensorMpa,
    mmCoefficient: sensorMm
  };
}
