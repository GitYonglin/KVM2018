import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-modal-form-data',
  templateUrl: './modal-form-data.component.html',
  styleUrls: ['./modal-form-data.component.less']
})
export class ModalFormDataComponent implements OnInit {
  imgFile: File;
  isVisible = false;
  formGroup: FormGroup = new FormGroup({});
  formTypes: any;
  title: string;

  @Input()
    width = 520;

  @Output()
    outClose = new EventEmitter<any> ();

  constructor(
    private message: NzMessageService
  ) { }

  ngOnInit() {}

  handleCancel(): void {
    this.outClose.emit();
  }

  submitForm() {
    // tslint:disable-next-line:forin
    for (const key in this.formGroup.controls) {
      this.formGroup.controls[ key ].markAsDirty();
      this.formGroup.controls[ key ].updateValueAndValidity();
    }
    if (this.formGroup.valid) {
      this.outClose.emit({...this.formGroup.value, imgFile: this.imgFile});
    } else {
      this.message.create('error', '输入有误！请输入正确的数据。');
    }
  }
  upFile(file, key) {
    this.formGroup.controls[key].setValue(window.URL.createObjectURL(file));
    this.imgFile = file;
  }
  ChangeTags(key) {
    this.formGroup.controls[ key ].markAsDirty();
    this.formGroup.controls[ key ].updateValueAndValidity();
  }

}
