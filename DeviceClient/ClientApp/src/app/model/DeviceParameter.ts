export interface DeviceParameter {
  dataArr: number[]; // PLC数据
  mpaUpperLimit: number; //   D500	压力上限
  returnMpa: number; // D501	允许回程压力
  settingMpa: number; // D502	超设置压力
  oilPumpDelay: number; // D503	油泵延时
  mmUpperLimit: number; // D504	位移上限
  mmLowerLimit: number; // D505	位移下限
  mmWorkUpperLimit: number; // D506	工作位移上限
  mmWorkLowerLimit: number; // D507	工作位移下限
  maximumDeviationRate: number; // D508	允许偏差率上限
  LowerDeviationRate: number; // D509	允许偏差率下限
  mpaDeviation: number; // D510	允许压力偏差
  mmBalanceControl: number; // D511	平衡控制
  mmReturnLowerLimit: number; // D512	倒顶位移下限
  unloadingDelay: number; // D513	卸荷完成延时
  simulationValue: number; // D514	PLC模拟量值
  mpaSensorUpperLimit: number; // D515	压力传感器上限
  mmSensorUpperLimit: number; // D516	位移传感器上限
  mpaCoefficient: number; // 压力传感器系数
  mmCoefficient: number; // 位移传感器系数
}
export enum  ConversionName {
  mpa = 'mpa',
  mm = 'mm',
  s = 's'
}

export enum DeviceItemName {
  a1 = 'a1',
  a2 = 'a2',
  b1 = 'b1',
  b2 = 'b2'
}

