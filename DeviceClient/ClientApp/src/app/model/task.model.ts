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
  /// <summary>
  /// 在项目ID
  /// </summary>
  projectId?: string;
  /// <summary>
  /// 梁名称
  /// </summary>
  bridgeName?: string;
  /// <summary>
  /// 使用钢绞线ID
  /// </summary>
  steelStrandId?: string;
  /// <summary>
  /// 使用设备ID
  /// </summary>
  deviceId?: string;
  /// <summary>
  /// 构建ID
  /// </summary>
  componentId?: string;
  /// <summary>
  /// 构建孔ID
  /// </summary>
  holeId?: string;
  /// <summary>
  /// 张拉孔数据明细
  /// </summary>
  holeGroups?: Array<HoleGroup>;
  /// <summary>
  /// 张拉组名称
  /// </summary>
  holeGroupsRadio?: Array<HoleGroupsRadio>;
  /// <summary>
  /// 使用设备明细
  /// </summary>
  device?: Device;
  /// <summary>
  /// 钢绞线明细
  /// </summary>
  steelStrand?: SteelStrand;
  /// <summary>
  /// 构建
  /// </summary>
  component?: Component;
  /// <summary>
  /// 孔道
  /// </summary>
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
/// <summary>
/// 张拉孔数据
/// </summary>
export interface HoleGroup extends Subset {
  /// <summary>
  /// 孔名称
  /// </summary>
  name: string;
  /// <summary>
  /// 张拉模式
  /// </summary>
  mode: number;
  // float SuperTensionStageValue
  /// <summary>
  /// 张拉力
  /// </summary>
  tensionKn: number;
  /// <summary>
  /// /张拉长度
  /// </summary>
  tensionLength: number;
  /// <summary>
  /// 钢绞线数量
  /// </summary>
  steelStrandNumber: number;
  /// <summary>
  /// 张拉段数
  /// </summary>
  tensionStage: string;
  /// <summary>
  /// 张拉阶段
  /// </summary>
  tensionStageValue: number[];
  /// <summary>
  /// 保压时间
  /// </summary>
  time: number[];
  /// <summary>
  /// 超张拉
  /// </summary>
  super: boolean;
  /// <summary>
  /// 二次张拉
  /// </summary>
  twice: boolean;
  /// <summary>
  /// A1数据
  /// </summary>
  a1?: ModeGroup;
  /// <summary>
  /// A2数据
  /// </summary>
  a2?: ModeGroup;
  /// <summary>
  /// B1数据
  /// </summary>
  b1?: ModeGroup;
  /// <summary>
  /// B2数据
  /// </summary>
  b2?: ModeGroup;
}
/// <summary>
/// 顶数据
/// </summary>
export interface ModeGroup {
  /// <summary>
  /// 工作端伸长量
  /// </summary>
  workMm: number;
  /// <summary>
  /// 回缩量
  /// </summary>
  retractionMm: number;
  /// <summary>
  /// 理论伸长量
  /// </summary>
  theoryMm: number;
}
/// <summary>
/// 张拉组名称组
/// </summary>
export interface HoleGroupsRadio {
  /// <summary>
  /// 张拉组ID
  /// </summary>
  Id: string;
  /// <summary>
  /// 组名称
  /// </summary>
  hole: string;
  /// <summary>
  /// 张拉状态
  /// </summary>
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
