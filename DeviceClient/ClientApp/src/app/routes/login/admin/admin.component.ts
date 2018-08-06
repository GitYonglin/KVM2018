import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { adminFormData } from './form.data';
import { APIService } from '../../../services/api.service';
import { state } from '@angular/animations';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.less']
})
export class AdminComponent implements OnInit {
  formGroup: FormGroup;
  formTypes: any;

  @Input()
    isVisible = false;

  constructor(
    private _service: APIService
  ) { }

  ngOnInit() {
    const form = adminFormData();
    this.formGroup = form.formGroup;
    this.formTypes = form.formTypes;
  }

  submitForm($event, value) {
    $event.preventDefault();
    // tslint:disable-next-line:forin
    for (const key in this.formGroup.controls) {
      this.formGroup.controls[ key ].markAsDirty();
      this.formGroup.controls[ key ].updateValueAndValidity();
    }
    if (this.formGroup.valid) {
      const fd = new FormData();
      // tslint:disable-next-line:forin
      for (const key in value) {
        fd.append(key, value[key]);
      }
      this._service.http('post', fd, '/admin/new', {success: '管理员', error: '管理员名称'}).subscribe(
        data => {
          console.log(data);
          if (data.state) {
            window.location.reload();
          }
        }
      );
    }
    console.log(value);
  }

}
