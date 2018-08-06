import { Validators } from '@angular/forms';
import { Text } from '../../utils/form';
import { constructFormGroupArr } from '../../utils/form/construct-form';

export function loginFormData(values = null) {
  const data = [
    new Text({
      key: 'Name',
      value: 'admin',
      prefix: '姓名',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
      }
    }),
    new Text({
      key: 'Password',
      value: 'admin',
      prefix: '登录密码',
      verification: [
        Validators.required,
      ],
      errors: {
        required: '必须输入。',
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
