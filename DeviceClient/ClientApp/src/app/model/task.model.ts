import { Base, Subset } from './base';
import { Hole, Component } from './component.model';
import { Device } from './device.model';
import { SteelStrand } from './project.model';

export const taskMenuData = [
  {
    id: '1',
    name: 'T梁',
    icon: 'avatars:svg-1',
    bridge: [
      { id: '1', name: '一号' },
      { id: '2', name: '二号' },
      { id: '3', name: '三号' },
      { id: '1', name: '一号' },
      { id: '2', name: '二号' },
      { id: '3', name: '三号' },
      { id: '1', name: '一号' },
      { id: '2', name: '二号' },
      { id: '3', name: '三号' },
      { id: '1', name: '一号' },
      { id: '2', name: '二号' },
      { id: '3', name: '三号' },
      { id: '1', name: '一号' },
      { id: '2', name: '二号' },
      { id: '3', name: '三号' },
      { id: '1', name: '一号' },
      { id: '2', name: '二号' },
      { id: '3', name: '三号' },
      { id: '1', name: '一号' },
      { id: '2', name: '二号' },
      { id: '3', name: '三号' },
      { id: '1', name: '一号' },
      { id: '2', name: '二号' },
      { id: '3', name: '三号' },
      { id: '1', name: '一号' },
      { id: '2', name: '二号' },
      { id: '3', name: '三号' },
      { id: '1', name: '一号' },
      { id: '2', name: '二号' },
      { id: '3', name: '三号' },
      { id: '1', name: '一号' },
      { id: '2', name: '二号' },
      { id: '3', name: '三号' },
      { id: '1', name: '一号' },
      { id: '2', name: '二号' },
      { id: '3', name: '三....号' },
    ]
  },
  {
    id: '2',
    name: '箱梁',
    icon: 'avatars:svg-2',
    bridge: [
      { id: '1', name: '一号' },
      { id: '2', name: '二号' },
      { id: '3', name: '三号' },
    ]
  },
];
export interface Task extends Base {
  /** 在项目ID */
  projectId?: string;
  /** 梁名称 */
  bridgeName?: string;
  /** 使用钢绞线ID */
  steelStrandId?: string;
  /** 使用设备ID */
  deviceId?: string;
  /** 构建ID */
  componentId?: string;
  /** 构建孔ID */
  holeId?: string;
  /** 张拉孔数据明细 */
  holeGroups?: Array<HoleGroup>;
  /** 张拉组名称 */
  holeGroupsRadio?: Array<HoleGroupsRadio>;
  /** 使用设备明细 */
  device?: Device;
  /** 钢绞线明细 */
  steelStrand?: SteelStrand;
  /** 构建 */
  component?: Component;
  /** 孔道 */
  hole?: Hole;
  /** 试块编号 */
  skNumber?: string;
  /** 试块强度 */
  skIntensity?: string;
  /** 设计强度 */
  designIntensity?: string;
  /** 张拉强度 */
  tensionIntensity?: string;
  /** 浇筑日期 */
  concretingDate?: Date;
  /** 摩擦系数 */
  friction?: string;
}
/**
 * 张拉孔数据
 *
 * @export
 * @interface HoleGroup
 * @extends {Subset}
 */
export interface HoleGroup extends Subset {
  /** 孔名称 */
  name: string;
  /** 张拉模式 */
  mode: number;
  // float SuperTensionStageValue
  /** 张拉力 */
  tensionKn: number;
  /** /张拉长度 */
  tensionLength: number;
  /** 钢绞线数量 */
  steelStrandNumber: number;
  /** 张拉段数 */
  tensionStage: string;
  /** 张拉阶段 */
  tensionStageValue: number[];
  /** 保压时间 */
  time: number[];
  /** 超张拉 */
  super: boolean;
  /** 二次张拉 */
  twice: boolean;
  /** A1数据 */
  a1?: ModeGroup;
  /** A2数据 */
  a2?: ModeGroup;
  /** B1数据 */
  b1?: ModeGroup;
  /** B2数据 */
  b2?: ModeGroup;
}
/**
 * 伸长量计算数据
 *
 * @export
 * @interface ModeGroup
 */
export interface ModeGroup {
  /** 工作端伸长量 */
  workMm: number;
  /** 回缩量 */
  retractionMm: number;
  /** 理论伸长量 */
  theoryMm: number;
}

/**
 * 张拉组名称组
 *
 * @export
 * @interface HoleGroupsRadio
 */
export interface HoleGroupsRadio {
  /** 张拉组ID */
  Id: string;
  /** 组名称 */
  hole: string;
  /** 张拉状态 */
  state: number;
}
export interface ConpomentHole {
  componetnName?: string;
  hole?: Hole;
}

export interface CopyTask {
  id?: string;
  bridgeName?: string;
  componentId?: string;
  projectId?: string;
}
