import { deviceModes } from '../model/device.model';

export function setCvs(d) {
  let time = null;
  const data = [];
  for (const name of deviceModes[d.mode]) {
    d[name].forEach((v, index) => {
      time = d.stimeState + index * 1000 * d.step;
      if (index === 0) {
        time = d.stimeState;
      }
      if (d[name].length - 1 === index ) {
        time = d.timeEnd;
      }
      data.push({time: time, value: v, type: name});
    });
  }
  return data;
}
