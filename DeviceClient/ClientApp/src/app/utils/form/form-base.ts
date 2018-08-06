export class FieldBase<T> {
  value: T;
  key: string;
  type: string;
  controlType: string;
  placeholder: string;
  prefix: string;
  verification: any;
  errors: any;
  errorText: string;
  radio?: any;
  checkbox?: any;
  filter?: Function;


  constructor(options: {
    type?: string,
    value?: T,
    key?: string,
    label?: string,
    required?: boolean,
    order?: number,
    controlType?: string,
    placeholder?: string,
    prefix?: string,
    verification?: any,
    errors?: any,
    errorText?: string,
    radio?: any;
    checkbox?: any;
    filter?: Function;
  } = {}) {
    this.type = options.type || 'text';
    this.value = options.value;
    this.key = options.key || '';
    this.controlType = options.controlType || '';
    this.placeholder = options.placeholder || '';
    this.prefix = options.prefix || null;
    this.verification = options.verification || null;
    this.errors = options.errors || null;
    this.errorText = options.errorText || null;
  }
}
