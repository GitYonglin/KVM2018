import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-children-form',
  templateUrl: './children-form.component.html',
  styleUrls: ['./children-form.component.less']
})
export class ChildrenFormComponent implements OnInit {
  imgFile: File;
  isVisible = false;

  @Input()
    formGroup: FormGroup;
  @Input()
    formTypes: any;
  @Input()
    formClass = '';

  constructor() { }

  ngOnInit() {}

  upFile(file, key) {
    this.formGroup.controls[key].setValue(window.URL.createObjectURL(file));
    this.imgFile = file;
  }
  onCheckbox(value) {
    console.log(value, this.formGroup);
  }
  checkboxModel(key, value) {
    console.log();
    return this.formGroup.controls[key].value.indexOf(value) > -1 ? true : false;
  }
}
