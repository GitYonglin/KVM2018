import { deviceModes } from '../model/device.model';
import { CvsData } from '../model/live.model';

export function setCvs(d: CvsData, key) {
  const data = [];
  // tslint:disable-next-line:forin
  for (const name in d[key]) {
    if (d[key][name]) {
      d[key][name].forEach((v, index) => {
        data.push({time: d.time[index], value: v, type: name});
      });
    }
  }
  return data;
}
