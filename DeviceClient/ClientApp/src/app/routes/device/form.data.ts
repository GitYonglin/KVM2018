import { Validators, FormGroup } from '@angular/forms';
import { Text, Radio, Checkbox } from '../../utils/form';
import { constructFormGroupArr } from '../../utils/form/construct-form';


// 允许选择日期过滤
function dCalibrationDateFilter(d: Date): boolean {
  // return differenceInDays(d, new Date) > 0;
  return d > new Date();
}

export const workMode = ['a1', 'a2', 'b1', 'b2'];
function baseFormData() {
  const data = [
    new Text({
      key: 'sName',
      value: '',
      prefix: '设备名称',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      key: 'sJackModel',
      prefix: '千斤顶型号',
      value: '',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。'
      }
    }),
    new Text({
      key: 'sPumpModel',
      prefix: '油泵型号',
      value: '',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。'
      }
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
    new Checkbox({
      key: 'aWorkMode',
      prefix: '设备工作模式',
      value: [4],
      checkbox: [
        { name: 'A1单顶', value: 0 },
        { name: 'A两顶', value: 1 },
        { name: 'B1单顶', value: 2 },
        { name: 'B两顶', value: 3 },
        { name: '四顶', value: 4 },
      ],
      verification: [
        Validators.required,
      ],
      errors: {
        required: '至少选择一项工作模式'
      }
    }),
    new Radio({
      key: 'bEquation',
      prefix: '标定方程式',
      value: true,
      radio: [
        { name: 'P=aF+b F张拉控制应力KN', value: true },
        { name: 'F=aP+b P张拉控制应力MPa', value: false },
      ],
    }),
  ];
  // return constructFormGroupArr(data);
  return data;
}

function calibratedFormData() {
  const infoData = [];
  const infoForm = [
    new Text({
      key: 'sJackNumber',
      value: '',
      prefix: '千斤顶编号',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。'
      }
    }),
    new Text({
      key: 'sPumpNumber',
      value: '',
      prefix: '油泵编号',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。'
      }
    }),
    new Text({
      key: 'a',
      type: 'number',
      value: '',
      prefix: '系数a',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。'
      }
    }),
    new Text({
      key: 'b',
      type: 'number',
      value: '',
      prefix: '系数b',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。'
      }
    }),
  ];
  workMode.forEach(key => {
    infoForm.forEach(d => {
      const item = Object.assign({}, d);
      // console.log(item, d);
      item.key = `${key}.calibrate.${d.key}`;
      infoData.push(item);
    });
  });
  // console.log(infoData);
  // return constructFormGroupArr(infoData);
  return infoData;
}


function correctionForm(key, prefix): Text {
  const item = Object.assign({}, new Text({
    key: '',
    type: 'number',
    value: 1,
    prefix: '',
    verification: [
      Validators.required,
    ],
    errors: {
      required: '必须输入。'
    },
    errorText: {}
  }));
  item.key = key;
  item.prefix = prefix;
  return item;
}
function correctionFormData() {
  const correctionData = [];
  // tslint:disable-next-line:max-line-length
  const correctionMpa = [2.5, 7.5, 12.5, 17.5, 22.5, 27.5, 32.5, 37.5, 42.5, 47.5, 52.5, 57.5];
  // tslint:disable-next-line:max-line-length
  const correctionMm = [20, 60, 100, 140, 180, 210];
  workMode.forEach(key => {
    correctionMm.forEach((prefix, index) => {
      const arr = [];
      const k = `${key}.correction.mm[${index}]`;
      correctionData.push(correctionForm(k, `${prefix}mm`));
    });
    correctionMpa.forEach((prefix, index) => {
      const k = `${key}.correction.mpa[${index}]`;
      // const value =  data[key].correction.mpa[index].correctionData;
      correctionData.push(correctionForm(k, `${prefix}Mpa`));
    });
  });
  // return constructFormGroupArr(correctionData);
  return correctionData;
}
export function constructFormData() {
  const form = constructFormGroupArr([...baseFormData(), ...calibratedFormData(), ...correctionFormData()]);
  const baseTypes = constructFormGroupArr(baseFormData()).formTypes;
  const calibratedTypes = constructFormGroupArr(calibratedFormData()).formTypes;
  const correctionTypes = constructFormGroupArr(correctionFormData()).formTypes;

  return { formGroup: form.formGroup, baseTypes: baseTypes, calibratedTypes: calibratedTypes, correctionTypes: correctionTypes };
}
export function setFormValue(data, formGroup) {
  const value = {};
  // tslint:disable-next-line:forin
  for (const key in data) {
    switch (key) {
      case 'a1':
      case 'a2':
      case 'b1':
      case 'b2':
        // tslint:disable-next-line:forin
        for (const iKey in data[key].calibrate) {
          value[`${key}.calibrate.${iKey}`] = data[key].calibrate[iKey];
        }
        data[key].correction.mm.forEach((iValue, index) => {
          value[`${key}.correction.mm[${index}]`] = iValue;
        });
        data[key].correction.mpa.forEach((iValue, index) => {
          value[`${key}.correction.mpa[${index}]`] = iValue;
        });
        break;
      default:
        value[key] = data[key];
        break;
    }
  }
  console.log('123123', value);
  // tslint:disable-next-line:forin
  for (const key in formGroup.value) {
    formGroup.controls[key].setValue(value[key]);
  }
}
