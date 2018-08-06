import { Validators } from '@angular/forms';
import { Text } from '../../utils/form';
import { constructFormGroupArr } from '../../utils/form/construct-form';

const text = new Text({
  key: '',
  value: '',
  prefix: '',
  verification: [
    Validators.required,
  ],
  errors: {
    required: '必须输入。',
  }
});
const key_prefix = [
  { key: 'sName', prefix: '构件名称'},
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

export function holeFormData(values = null) {
  const data = [
    new Text({
      key: 'imgUrl',
      type: 'file',
      value: '',
      prefix: '示意图',
    }),
    new Text({
      key: 'sName',
      value: '',
      prefix: '名称',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      key: 'holes',
      value: [],
      prefix: '孔明细',
      type: 'tag',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '至少需要一个孔号',
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
