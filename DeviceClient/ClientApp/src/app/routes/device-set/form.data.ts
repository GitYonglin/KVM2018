import { Validators, FormGroup } from '@angular/forms';
import { Text, Radio, Checkbox } from '../../utils/form';
import { constructFormGroupArr } from '../../utils/form/construct-form';

export function baseForm(data) {
  const form = [
    new Text({
      after: 'mpa',
      key: 'mpaUpperLimit',
      value: '',
      prefix: '压力上限',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      after: 'mpa',
      key: 'returnMpa',
      value: '',
      prefix: '允许回程压力',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      after: 'mpa',
      key: 'settingMpa',
      value: '',
      prefix: '超设置压力',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      after: 's',
      key: 'oilPumpDelay',
      value: '',
      prefix: '油泵延时',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      after: 'mm',
      key: 'mmUpperLimit',
      value: '',
      prefix: '位移上限',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      after: 'mm',
      key: 'mmLowerLimit',
      value: '',
      prefix: '位移下限',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Radio({
      key: 'modeRadio',
      prefix: '设备模式',
      value: '1',
      radio: [
        { name: '一泵一顶', value: '1' },
        { name: '一泵两顶', value: '2' },
      ],
    }),
    // new Text({
    //   after: 'mm',
    //   key: 'mmWorkUpperLimit',
    //   value: '',
    //   prefix: '工作位移上限',
    //   verification: [
    //     Validators.required,
    //   ],
    //   errors: {
    //     required: '必须输入。',
    //   }
    // }),
    // new Text({
    //   after: 'mm',
    //   key: 'mmWorkLowerLimit',
    //   value: '',
    //   prefix: '工作位移下限',
    //   verification: [
    //     Validators.required,
    //   ],
    //   errors: {
    //     required: '必须输入。',
    //   }
    // }),
  ];
  if (data) {
    form.map(item => {
      item.value = data[item.key];
    });
  }
  return constructFormGroupArr(form);
}
