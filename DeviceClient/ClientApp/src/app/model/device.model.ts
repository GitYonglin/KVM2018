import { Base } from './base';

export const deviceMenuData = [
  {
    id: '1',
    name: '150T',
    icon: 'avatars:svg-1',
  },
  {
    id: '2',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '3',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '4',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '5',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '6',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '7',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '8',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '9',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '10',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '11',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '12',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '13',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '14',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '15',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '16',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '17',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '18',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '19',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '20',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '21',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '22',
    name: '500T',
    icon: 'avatars:svg-2',
  },
  {
    id: '23',
    name: '50023T',
    icon: 'avatars:svg-2',
  },
];
export const deviceData = {
  sName: '',
  aWorkMode: [0, 1, 2, 3, 4], // 设备工作模式 A单顶 A两顶 B单顶 B两顶 4顶
  sJackModel: '千斤顶型号', // 千斤顶型号
  sPumpModel: '油泵型号', // 油泵型号
  dCalibrationDate: new Date(), // 标定日期
  bEquation: true, // 标定方程式 true
  A1: {
    sJackNumber: '千斤顶编号', // 千斤顶编号
    sPumpNumber: '油泵编号', // 油泵编号
    a: 1, // 回归方程系数a
    b: 1, // 回归方程系数b
    correction: {
      mm: [
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
      ],
      mpa: [
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
      ]
    }
  },
  A2: {
    sJackNumber: '千斤顶编号', // 千斤顶编号
    sPumpNumber: '油泵编号', // 油泵编号
    a: 1, // 回归方程系数a
    b: 1, // 回归方程系数b
    correction: {
      mm: [
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
      ],
      mpa: [
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
      ]
    }
  },
  B1: {
    sJackNumber: '千斤顶编号', // 千斤顶编号
    sPumpNumber: '油泵编号', // 油泵编号
    a: 1, // 回归方程系数a
    b: 1, // 回归方程系数b
    correction: {
      mm: [
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
      ],
      mpa: [
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
      ]
    }
  },
  B2: {
    sJackNumber: '千斤顶编号', // 千斤顶编号
    sPumpNumber: '油泵编号', // 油泵编号
    a: 1, // 回归方程系数a
    b: 1, // 回归方程系数b
    correction: {
      mm: [
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
      ],
      mpa: [
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
        { correctionData: 1 },
      ]
    }
  }
};
/** 泵顶组合方式  0['a1'] 1['a1', 'a2'] 2['b1'] 3['b1', 'b2'] 4['a1', 'a2', 'b1', 'b2'] */
export const deviceModes = [['a1'], ['a1', 'a2'], ['b1'], ['b1', 'b2'], ['a1', 'a2', 'b1', 'b2']];


export interface Device extends Base {
  //    sName
  //  设备名称
  // 必须输入。
  //  sJackModel
  // 千斤顶型号
  // sPumpModel
  // 油泵型号
  // dCalibrationDate
  // 标定日期
  // aWorkMode
  // 设备工作模式
  // bEquation
  // 标定方程式
  sName: string;
  sJackModel: string;
  sPumpModel: string;
  dCalibrationDate: Date;
  aWorkMode: Array<number>;
  bEquation: boolean;
  a1: CalibrateCorrection;
  a2: CalibrateCorrection;
  b1: CalibrateCorrection;
  b2: CalibrateCorrection;
}

export interface CalibrateCorrection {
  calibrate: Calibrate;
  correction: Correction;
}

export interface Calibrate {
  //    sJackNumber
  // 千斤顶编号
  // sPumpNumber
  // 油泵编号
  // a
  // 系数a
  // b
  // 系数b
  sJackNumber: string;
  sPumpNumber: string;
  a: number;
  b: number;
}

export interface Correction {
  mm: Array<number>;
  mpa: Array<number>;
}
