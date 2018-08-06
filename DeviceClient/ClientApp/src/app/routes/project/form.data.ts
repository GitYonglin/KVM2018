import { Validators } from '@angular/forms';
import { Text, Radio } from '../../utils/form';
import { constructFormGroupArr } from '../../utils/form/construct-form';

const text = new Text({
  key: '',
  value: '',
  prefix: '设备名称',
  verification: [
    Validators.required,
  ],
  errors: {
    required: '必须输入。',
  }
});
const key_prefix = [
  { key: 'sProjectName', prefix: '项目名称'},
  { key: 'sDivisionProject', prefix: '分布工程'},
  { key: 'sConstructionUnit', prefix: '施工单位'},
  { key: 'sSubProject', prefix: '分项工程'},
  { key: 'sUnitProject', prefix: '单位工程'},
  { key: 'sEngineeringSite', prefix: '工程部位'},
  { key: 'sContractSection', prefix: '合同段'},
  { key: 'sStationRange', prefix: '桩号范围'},
];

export function constructFormData() {
  const data = [];
  key_prefix.forEach(item => {
    const copyText = Object.assign({}, text);
    copyText.key = item.key;
    copyText.prefix = item.prefix;
    data.push(copyText);
  });
  return constructFormGroupArr(data);
}

export function operatorFormData(values = null) {
  const data = [
    new Radio({
      key: 'nAuthority',
      value: true,
      prefix: '角色',
      radio: [
        { name: '管理员', value: true },
        { name: '操作员', value: false },
      ],
    }),
    new Text({
      key: 'sName',
      value: '',
      prefix: '姓名',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      key: 'sPassword',
      value: '',
      prefix: '登录密码',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      key: 'sPhone',
      value: '',
      prefix: '联系方式',
    }),
    new Text({
      key: 'imgUrl',
      type: 'file',
      value: '',
      prefix: '头像',
    }),
  ];
  if (values) {
    data.forEach(item => {
      item.value = values[item.key];
    });
  }
  return constructFormGroupArr(data);
}
export function supervisionFormData(values = null) {
  // id: 'string',
  //     sName: '监理1', // 姓名
  //     sPhone: '12312341234', // 手机号码
  //     imgUrl: 'https://ng.ant.design/assets/img/logo.svg', // 图片
  //     sUnit: 'xxxx监理公司',
  const data = [
    new Text({
      key: 'sName',
      value: '',
      prefix: '姓名',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      key: 'sUnit',
      value: '',
      prefix: '监理单位',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      key: 'sPhone',
      value: '',
      prefix: '联系方式',
    }),
    new Text({
      key: 'imgUrl',
      type: 'file',
      value: '',
      prefix: '头像',
    }),
  ];
  if (values) {
    data.forEach(item => {
      item.value = values[item.key];
    });
  }
  return constructFormGroupArr(data);
}
// 允许选择日期过滤
function dCalibrationDateFilter(d: Date): boolean {
  // return differenceInDays(d, new Date) > 0;
  return d > new Date();
}
export function steelStrandFormData(values = null) {
  // sName: '名称',
  //     sModel: '钢绞线型号',
  //     sFrictionCoefficient: '1111',
  //     dCalibrationDate: new Date(),
  //     sReportNo: '14873853',
  const data = [
    new Text({
      key: 'sName',
      prefix: '名称',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      key: 'sModel',
      prefix: '钢绞线型号',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      key: 'sFrictionCoefficient',
      prefix: '摩擦系数',
    }),
    new Text({
      key: 'sReportNo',
      prefix: '报告编号',
    }),
    new Text({
      key: 'dCalibrationDate',
      filter: dCalibrationDateFilter,
      type: 'date',
      prefix: '标定日期',
      value: '',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须设置。'
      }
    }),
  ];
  if (values) {
    data.forEach(item => {
      item.value = values[item.key];
    });
  }
  return constructFormGroupArr(data);
}
