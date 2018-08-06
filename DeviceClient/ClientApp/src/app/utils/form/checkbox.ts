import { FieldBase } from './form-base';

interface CheckData {
  name: string;
  value: string;
}

export class Checkbox extends FieldBase<string> {
  type = 'checkbox';
  checkbox: CheckData[];

  constructor(options: {} = {}) {
    super(options);
    this.checkbox = options['checkbox'] || [];
  }
}
