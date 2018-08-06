import { FieldBase } from './form-base';

interface RadioData {
  name: string;
  value: string;
}

export class Radio extends FieldBase<string> {
  type = 'radio';
  radio: RadioData[];

  constructor(options: {} = {}) {
    super(options);
    this.radio = options['radio'] || [];
  }
}
