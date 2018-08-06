export function Value2PLC(value: number, sensor: number, MpaMm: number = 5,  correction: number[] = null): number {
  // return Math.round(value * sensor) || 0;
  const item = value * sensor;
  // console.log('88888888', correction, correction[Math.round(value / 40)]);
  if (correction === null) {
    return Math.round(item) || 0;
  } else {
    return Math.round((item / correction[Math.round(value / MpaMm)])) || 0;
  }
}

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

