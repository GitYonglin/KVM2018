import { Pipe, PipeTransform } from '@angular/core';
import { Injectable, Inject } from '@angular/core';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
@Pipe({ name: 'formError' })
export class FormErrorPipe implements PipeTransform {
  transform(controlsError: object, errors: object): string {
    if (controlsError) {
      const returnErrors = [];
      // tslint:disable-next-line:forin
      for (const item in controlsError) {
        returnErrors.push(errors[item]);
      }
      return returnErrors.join(',');
      // console.log(this.field.key, this.form.valid, this.error);
    } else {
      return null;
    }
  }
}

@Pipe({ name: 'imgUrl' })
export class ImgUrlPipe implements PipeTransform {
  constructor(@Inject('BASE_CONFIG') private config) {}
  transform(imgUrl: any): string {
    console.log('图片地址', imgUrl === null);
    if (imgUrl === null) {
      return null;
    }
    if (imgUrl && !imgUrl.startsWith('blob')) {
      return `${imgUrl}`;
    } else {
      return imgUrl;
    }
  }
}

@Pipe({ name: 'deviceMode' })
export class DeviceMode implements PipeTransform {
  constructor(@Inject('BASE_CONFIG') private config) {}
  transform(mode: any): string {
    const modeStr = ['A单顶', 'A两顶', 'B单顶', 'B两顶', '四顶'];
    return modeStr[mode];
  }
}

// 浮点数格式化
@Pipe({ name: 'N2F' })
export class Number2Float implements PipeTransform {
  constructor(@Inject('BASE_CONFIG') private config) {}
  transform(value: number, no: number = 2): number {
    return Number(value.toFixed(no));
  }
}

// 大小写转换
@Pipe({ name: 'L2U' })
export class Lower2Upper implements PipeTransform {
  constructor(@Inject('BASE_CONFIG') private config) {}
  transform(value: string): string {
    return value.toUpperCase();
  }
}
// 多选框是否选择
@Pipe({ name: 'CheckboxSelect' })
export class CheckboxSelect implements PipeTransform {
  constructor(@Inject('BASE_CONFIG') private config) {}
  transform(value: string, datas: Array<any>): boolean {
    const ds = datas.join('');
    console.log('pipe', datas, ds);
    return ds.indexOf(value) > -1;
  }
}

