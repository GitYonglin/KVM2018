import { FieldBase } from './form-base';

export class Text extends FieldBase<string | number> {
  type = 'text';
  filter?: Function;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || 'text';
    this.filter = options['filter'] || null;
  }
}
