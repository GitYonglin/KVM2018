import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Text } from '../../utils/form';
import { constructFormGroupArr, constructFormGroupObject } from '../../utils/form/construct-form';

export function constructFormData() {
  const base = [
    new Text({
      key: 'componentName',
      value: '',
      prefix: '构件',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      key: 'holeName',
      value: '',
      prefix: '孔名',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      key: 'deviceName',
      value: '',
      prefix: '设备',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      key: 'bridgeName',
      value: '123123',
      prefix: '梁号',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      key: 'steelStrandName',
      value: '',
      prefix: '钢绞线',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),

  ];
  return constructFormGroupObject(base);
}
const taskForm = [
  new Text({
    key: 'name',
    value: '',
    prefix: '组名称',
  }),
  new Text({
    key: 'mode',
    value: '',
    prefix: '张拉模式',
  }),
  new Text({
    key: 'tensionKn',
    type: 'number',
    prefix: '张拉应力',
    verification: [
      Validators.required,
    ],
    errors: {
      required: '必须输入。',
    }
  }),
  new Text({
    key: 'tensionLength',
    type: 'number',
    prefix: '张拉长度',
  }),
  new Text({
    key: 'steelStrandNumber',
    type: 'number',
    prefix: '钢绞线数量',
  }),
  new Text({
    key: 'tensionStage',
    value: 4,
    type: 'number',
    prefix: '张拉段数',
  }),
  new Text({
    key: 'twice',
    value: false,
    prefix: '二次张拉',
  }),
  new Text({
    key: 'super',
    value: false,
    prefix: '超张拉',
  }),
  new Text({
    key: 'tensionStageValue[0]',
    value: 10,
    type: 'number',
    verification: [
      Validators.required,
    ],
    errors: {
      required: '必须输入。',
    }
  }),
  new Text({
    key: 'tensionStageValue[1]',
    value: 20,
    type: 'number',
    verification: [
      Validators.required,
    ],
  }),
  new Text({
    key: 'tensionStageValue[2]',
    value: 50,
    type: 'number',
    verification: [
      Validators.required,
    ],
  }),
  new Text({
    key: 'tensionStageValue[3]',
    value: 80,
    type: 'number',
    verification: [
      Validators.required,
    ],
  }),
  new Text({
    key: 'tensionStageValue[4]',
    value: 100,
    type: 'number',
    verification: [
      Validators.required,
    ],
  }),
  new Text({
    key: 'tensionStageValue[5]',
    value: 100,
    type: 'number',
    verification: [
      Validators.required,
    ],
  }),
  new Text({
    key: 'time[0]',
    value: 10,
    type: 'number',
    verification: [
      Validators.required,
    ],
    errors: {
      required: '必须输入。',
    }
  }),
  new Text({
    key: 'time[1]',
    value: 20,
    type: 'number',
    verification: [
      Validators.required,
    ],
  }),
  new Text({
    key: 'time[2]',
    value: 50,
    type: 'number',
    verification: [
      Validators.required,
    ],
  }),
  new Text({
    key: 'time[3]',
    value: 80,
    type: 'number',
    verification: [
      Validators.required,
    ],
  }),
  new Text({
    key: 'time[4]',
    value: 100,
    type: 'number',
    verification: [
      Validators.required,
    ],
  }),
  new Text({
    key: 'time[5]',
    value: 100,
    type: 'number',
    verification: [
      Validators.required,
    ],
  }),
  new Text({
    key: 'superTensionStageValue',
    value: 110,
    type: 'number',
  }),
  new Text({
    key: 'a1.workMm',
    value: 0,
    type: 'number',
    prefix: '工作长度',
    verification: [
      Validators.required,
    ],
    errors: {
      required: '必须输入。',
    }
  }),
  new Text({
    key: 'a1.retractionMm',
    value: 0,
    type: 'number',
    prefix: '内缩均值',
    verification: [
      Validators.required,
    ],
    errors: {
      required: '必须输入。',
    }
  }),
  new Text({
    key: 'a1.theoryMm',
    value: 0,
    type: 'number',
    prefix: '理论伸长量',
    verification: [
      Validators.required,
    ],
    errors: {
      required: '必须输入。',
    }
  }),
  new Text({
    key: 'a2.workMm',
    value: 0,
    type: 'number',
    prefix: '工作长度',
    verification: [
      Validators.required,
    ],
    errors: {
      required: '必须输入。',
    }
  }),
  new Text({
    key: 'a2.retractionMm',
    value: 0,
    type: 'number',
    prefix: '内缩均值',
    verification: [
      Validators.required,
    ],
    errors: {
      required: '必须输入。',
    }
  }),
  new Text({
    key: 'a2.theoryMm',
    value: 0,
    type: 'number',
    prefix: '理论伸长量',
    verification: [
      Validators.required,
    ],
    errors: {
      required: '必须输入。',
    }
  }),
  new Text({
    key: 'b1.workMm',
    value: 0,
    type: 'number',
    prefix: '工作长度',
    verification: [
      Validators.required,
    ],
    errors: {
      required: '必须输入。',
    }
  }),
  new Text({
    key: 'b1.retractionMm',
    value: 0,
    type: 'number',
    prefix: '内缩均值',
    verification: [
      Validators.required,
    ],
    errors: {
      required: '必须输入。',
    }
  }),
  new Text({
    key: 'b1.theoryMm',
    value: 0,
    type: 'number',
    prefix: '理论伸长量',
    verification: [
      Validators.required,
    ],
    errors: {
      required: '必须输入。',
    }
  }),
  new Text({
    key: 'b2.workMm',
    value: 0,
    type: 'number',
    prefix: '工作长度',
    verification: [
      Validators.required,
    ],
    errors: {
      required: '必须输入。',
    }
  }),
  new Text({
    key: 'b2.retractionMm',
    value: 0,
    type: 'number',
    prefix: '内缩均值',
    verification: [
      Validators.required,
    ],
    errors: {
      required: '必须输入。',
    }
  }),
  new Text({
    key: 'b2.theoryMm',
    value: 0,
    type: 'number',
    prefix: '理论伸长量',
    verification: [
      Validators.required,
    ],
    errors: {
      required: '必须输入。',
    }
  }),
];

export function constructHoleFromGroup() {
  return constructFormGroupObject(taskForm);
}
export function setHoleFormValue(data, formGroup: FormGroup) {
  console.log(data);
  // tslint:disable-next-line:forin
  for (const key in data) {
    console.log(key, key in formGroup.controls);
    if (key in formGroup.controls) {
      formGroup.controls[key].setValue(data[key]);
    }
  }
  console.log(data);
}
