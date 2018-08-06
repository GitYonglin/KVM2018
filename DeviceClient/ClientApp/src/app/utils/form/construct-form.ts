import { FormGroup, FormControl } from '@angular/forms';

export function constructFormGroup(data, formType?, values?) {
  const formGroup = [];
  data.forEach(item => {
    const ft = Object.assign({}, item.formType || formType);
    if ('key' in item) {
      ft.key = item.key;
      ft.matPrefix = item.matPrefix;
      ft.value = values ? values[item.key] : ft.value;
    }
    formGroup.push(ft);
  });
  return setFormGroup(formGroup);
}
export function constructFormGroupArr(data) {
  return setFormGroup(data);
}

function setFormGroup(data): { formTypes: any, formGroup: FormGroup } {
  const formGroup = new FormGroup({});
  data.forEach(field => {
    formGroup.addControl(field.key, new FormControl(
      field.value, field.verification || null
    ));
  });
  return { formTypes: data, formGroup: formGroup };
}

export function constructFormGroupObject(data): { formTypes: any, formGroup: FormGroup }  {
  const formGroup = new FormGroup({});
  const formTypes = {};
  data.forEach(field => {
    formGroup.addControl(field.key, new FormControl(
      field.value, field.verification || null
    ));
    formTypes[field.key] = field;
  });
  return { formTypes: formTypes, formGroup: formGroup };
}

export function setFromValue(values, formGroup: FormGroup): void {
  // tslint:disable-next-line:forin
  for (const key in formGroup.value) {
    formGroup.controls[key].setValue(values[key]);
  }
}
