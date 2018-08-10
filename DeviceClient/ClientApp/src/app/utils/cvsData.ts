import { deviceModes } from '../model/device.model';
import { CvsData } from '../model/live.model';

export function setCvs(d: CvsData, key) {
  let time = null;
  const data = [];
  // tslint:disable-next-line:forin
  for (const name in d[key]) {
    d[key][name].forEach((v, index) => {
      time = Number(d.timeState) + index * 1000 * d.skep;
      if (index === 0) {
        time = Number(d.timeState);
      }
      if (d[key][name].length - 1 === index ) {
        time = Number(d.timeEnd);
      }
      data.push({time: time, value: v, type: name});
    });
  }
  return data;
}
