import { HoleGroup } from '../model/task.model';
import { Record } from '../model/record.model';
import { Device } from '../model/device.model';
import { funcRetraction, funcSumData } from '../model/live.model';

export interface ExportDatas {
  holeData: HoleGroup[];
  record: Record[];
}
interface ExportData {
  holeData: HoleGroup;
  record: Record;
}
interface ExportItem {
  /** 孔号 */
  hole: string;
  /** 张拉断面 */
  mode: string;
  /** 油泵千斤顶编码 */
  ocNO: string;
  /** 阶段数据 */
  stageData: StageItem[];
  /** 力筋回缩量 */
  retraction: number;
  /** 回油值初应力 */
  returnStart: StageItem;
  /** 设置KN */
  tensionKn: number;
  /** 张拉长度 */
  tensiongLength: number;
  /** 理论伸长量 */
  theoryMm: number;
  /** 总伸长量 */
  sum: number;
  /** 偏差率 */
  deviation: number;
}
interface StageItem {
  /** mpa */
  mpa: number;
  /** KN */
  kn: number;
  /** mm */
  mm: number;
}
class GetExportItem {
  exportItem: ExportItem[] = [];
  constructor(data: ExportData, device: Device) {
    const mode = data.holeData.mode;
    const task = data.holeData;
    const record = data.record;
    const retraction = funcRetraction(record, task);
    const sum = funcSumData(record.mm, task);
    const hole = {
      a: '',
      b: ''
    };
    // console.log(task.name, task.name.split('/'));
    switch (mode) {
      case 0:
      case 1:
        hole.a = task.name;
        break;
      case 2:
      case 3:
        hole.a = task.name;
        break;
      case 4:
        const n = task.name.split('/');
        hole.a = n[0];
        hole.b = n[1];
        break;
      default:
        break;
    }
    if (mode === 0 || mode === 1 || mode === 4) {
      this.exportItem.push(
        {
          hole: hole.a,
          mode: 'A1',
          ocNO: `${device.sPumpModel}/${device.a1.calibrate.sJackNumber}`,
          stageData: this.getStageData(record.mpa.a1, record.mm.a1),
          retraction: retraction.a1,
          returnStart: this.getReturnStart(record.returnStart.a1),
          tensionKn: task.tensionKn,
          tensiongLength: task.tensionLength,
          theoryMm: task.a1.theoryMm,
          sum: sum.a1.sum,
          deviation: sum.a1.deviation,
        });
    }
    if (mode === 1 || mode === 4) {
      this.exportItem.push(
        {
          hole: hole.a,
          mode: 'A2',
          ocNO: `${device.sPumpModel}/${device.a2.calibrate.sJackNumber}`,
          stageData: this.getStageData(record.mpa.a2, record.mm.a2),
          retraction: retraction.a2,
          returnStart: this.getReturnStart(record.returnStart.a2),
          tensionKn: task.tensionKn,
          tensiongLength: task.tensionLength,
          theoryMm: null,
          sum: null,
          deviation: null
        });
    }
    if (mode === 2 || mode === 3 || mode === 4) {
      this.exportItem.push(
        {
          hole: hole.b,
          mode: 'B1',
          ocNO: `${device.sPumpModel}/${device.b1.calibrate.sJackNumber}`,
          stageData: this.getStageData(record.mpa.b1, record.mm.b1),
          retraction: retraction.b1,
          returnStart: this.getReturnStart(record.returnStart.b1),
          tensionKn: task.tensionKn,
          tensiongLength: task.tensionLength,
          theoryMm: task.b1.theoryMm,
          sum: sum.b1.sum,
          deviation: sum.b1.deviation
        });
    }
    if (mode === 3 || mode === 4) {
      this.exportItem.push(
        {
          hole: hole.b,
          mode: 'B2',
          ocNO: `${device.sPumpModel}/${device.b2.calibrate.sJackNumber}`,
          stageData: this.getStageData(record.mpa.b2, record.mm.b2),
          retraction: retraction.b2,
          returnStart: this.getReturnStart(record.returnStart.b2),
          tensionKn: task.tensionKn,
          tensiongLength: task.tensionLength,
          theoryMm: null,
          sum: null,
          deviation: null
        });
    }
  }
    getStageData(mpa: number[], mm: number[]): StageItem[] {
      const stageItem: StageItem[] = [];
      mpa.forEach((value, index) => {
        stageItem.push({mpa: value, kn: value, mm: mm[index]});
      });
      return stageItem;
    }
    getReturnStart(data): StageItem {
      return {mpa: data.mpa, kn: data.mpa, mm: data.mm};
    }
}

/**
 *构造导出数据
 *
 * @export
 * @param {ExportDatas} data 任务记录数据
 * @param {Device} device 设备数据
 * @returns {ExportItem[]} 返回倒数表格数据
 */
export function exportData(data: ExportDatas, device: Device): ExportItem[] {
  console.log(data);
  const es: ExportItem[] = [];
  const hole = data.holeData.sort((a, b) => a.name < b.name ? 0 : 1);
  hole.map( h => {
    const record = data.record.filter(r => r.id === h.id)[0];
    const ei: ExportData = { holeData: h, record: record};
    es.push(...new GetExportItem(ei, device).exportItem);
  });
  return es;
}
