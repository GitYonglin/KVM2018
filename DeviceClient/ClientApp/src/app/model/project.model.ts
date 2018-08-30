import { Base, Subset } from './base';

export const projectMenuData = [
  {
    id: '1',
    name: '项目一1',
    icon: 'avatars:svg-1',
  },
  {
    id: '2',
    name: '项目二2',
    icon: 'avatars:svg-2',
  },
  {
    id: '3',
    name: '项目二3',
    icon: 'avatars:svg-2',
  },
  {
    id: '4',
    name: '项目二4',
    icon: 'avatars:svg-2',
  },
  {
    id: '5',
    name: '项目二5',
    icon: 'avatars:svg-2',
  },
  {
    id: '6',
    name: '项目二6',
    icon: 'avatars:svg-2',
  },
  {
    id: '7',
    name: '项目二7',
    icon: 'avatars:svg-2',
  },
  {
    id: '8',
    name: '项目二8',
    icon: 'avatars:svg-2',
  },
  {
    id: '9',
    name: '项目二9',
    icon: 'avatars:svg-2',
  },
];
export const projectData = {
  id: '',
  sProjectName: '项目名称',   // 项目名称
  sDivisionProject: '分布工程', // 分布工程
  sConstructionUnit: '施工单位',  // 施工单位
  sSubProject: '分项工程', // 分项工程
  sUnitProject: '单位工程', // 单位工程
  sEngineeringSite: '工程部位', // 工程部位
  // sSupervisionUnit: 'string', // 监理单位
  sContractSection: '合同段', // 合同段
  sStationRange: '桩号范围', // 桩号范围
  operator: [], // 操作员
  supervision: [], // 监理
  steelStrand: [], // 钢绞线
};

export interface Project extends Base {
  // id: string;
  // sProjectName: string;   // 项目名称
  // sDivisionProject: string; // 分布工程
  // sConstructionUnit: string;  // 施工单位
  // sSubProject: string; // 分项工程
  // sUnitProject: string; // 单位工程
  // sEngineeringSite: string; // 工程部位
  // sContractSection: string; // 合同段
  // sStationRange: string; // 桩号范围
  // operator: Operator[]; // 操作员
  // supervision: Supervision[]; // 监理
  // steelStrand: SteelStrand[]; // 钢绞线
  // string Id: string;
  sProjectName: string;
  sDivisionProject: string;
  sConstructionUnit: string;
  sSubProject: string;
  sUnitProject: string;
  sEngineeringSite: string;
  sContractSection: string;
  sStationRange: string;
  Operators: Array<Operator>;
  Supervisions: Array<Supervision>;
  SteelStrands: Array<SteelStrand>;
}

export interface Operator extends Subset {
  // id: string;
  // sName: string; // 姓名
  // sPassword: string; // 登录密码
  // sImage?: string; // 图片
  // sPhone?: string; // 手机号码
  // nAuthority: Number; // 权限管理
  // string ProjectId: string;
  // string Id: string;
  // string sName: string;
  sPassword: string;
  sPhone: string;
  ImgFile: File;
  ImgUrl: string;
  menuAuthority: string[];
  operatorAuthority: string[];
}

export interface SteelStrand extends Subset {
  //   sName: string; // 钢绞线名称
  //   sModel: string; // 钢绞线型号
  //   sFrictionCoefficient: string; // 摩擦系数
  //   sReportNo: string; // 报告编号
  //   dCalibrationDate: Date; // 标定日期
  sModel: string;
  sFrictionCoefficient: string;
  sReportNo: string;
  dCalibrationDate: Date;
  ImgFile: File;
  ImgUrl: string;
}

export interface Supervision extends Subset {
  // id: string;
  // sName: string; // 姓名
  // sPassword: string; // 登录密码
  // sImage?: string; // 图片
  // sPhone?: string; // 手机号码
  // nAuthority: Number; // 权限管理
  sPhone: string;
  sUnit: string;
  ImgFile: File;
  ImgUrl: string;
}
