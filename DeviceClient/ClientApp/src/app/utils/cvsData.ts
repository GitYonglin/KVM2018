import { deviceModes } from '../model/device.model';
import { CvsData } from '../model/live.model';

export function setCvs(d: CvsData, mode, key) {
  let time = null;
  const data = [];
  for (const name of deviceModes[mode]) {
    d[key][name].forEach((v, index) => {
      time = d.timeState + index * 1000 * d.skep;
      if (index === 0) {
        time = d.timeState;
      }
      if (d[key][name].length - 1 === index ) {
        time = d.timeEnd;
      }
      data.push({time: time, value: v, type: name});
    });
  }
  return data;
}
