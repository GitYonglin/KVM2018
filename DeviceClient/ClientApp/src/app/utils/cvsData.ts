import { deviceModes } from '../model/device.model';
import { CvsData } from '../model/live.model';

export function setCvs(d: CvsData) {
  const data = {
    mpa: [],
    mm: []
  };
  // tslint:disable-next-line:forin
  for (const name in d.mpa) {
    if (d.mpa[name]) {
      d.mpa[name].forEach((v, index) => {
        const time = d.time[index];
        const mm = d.mm[name][index];
        data.mpa.push({time: time, value: v, type: name});
        data.mm.push({time: time, value: mm, type: name});
      });
    }
  }
  return data;
}
