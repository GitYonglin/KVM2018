import { Component, OnInit, ViewChild } from '@angular/core';
import { LeftMenuComponent } from '../../shared/left-menu/left-menu.component';
import { ModalFormDataComponent } from '../../shared/form/modal-form-data/modal-form-data.component';
import { FormGroup } from '@angular/forms';
import { APIService } from '../../services/api.service';
import { newFormData, upDataFormData } from '../../utils/form/constructor-FormData';
import { constructFormData, setFormValue } from './form.data';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../app.service';

const baseUri = '/device';
@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.less']
})

export class DeviceComponent implements OnInit {
  @ViewChild(LeftMenuComponent)
    private LeftMenu: LeftMenuComponent;

  formGroup: FormGroup;
  baseTypes: any;
  calibratedTypes: any;
  correctionTypes: any;
  nowProjectData: any;
  nowEditData: any;
  tabIndex = 0;

  constructor(
    private _servers: APIService,
    private _activatedRoute: ActivatedRoute,
    public _appService: AppService,
  ) { }

  ngOnInit() {
    this.newForm();
    this.formGroup.disable(); // 输入框禁止编辑状态
    this._activatedRoute.params.subscribe(params => {
      console.log('路由', params);
      if ('id' in params && this.LeftMenu.titleId !== params.id && params.id !== 'null') {
        this.LeftMenu.titleId = params.id;
        this.menuSwitch();
      } else if (params.id === 'null') {
        this.add();
      }
    });
  }
  newForm() {
    const form = constructFormData();
    this.formGroup = form.formGroup;
    this.baseTypes = form.baseTypes;
    this.calibratedTypes = form.calibratedTypes;
    this.correctionTypes = form.correctionTypes;
    console.log(form);
  }
  /**
   *菜单切换
   *
   * @memberof ProjectComponent
   */
  menuSwitch() {
    this._servers.get(`${baseUri}/${this.LeftMenu.titleId}`).subscribe(r => {
      console.log('123123123123123123123', r);
      this.formGroup.disable();
      this.LeftMenu.operationState = false;
      this.nowProjectData = r;
      setFormValue(r, this.formGroup);
    });
  }
  operation(name) {
    this[name]();
  }
  onAdd() {
    this._appService.setGoUrl('/device', { id: null });
  }
  add() {
    console.log('添加');
    this.newForm();
    this.nowProjectData = null;
    this.formGroup.enable();
    this.LeftMenu.operationState = true;
    this.LeftMenu.titleId = null;
    this._appService.editState = true;
  }
  onModify() {
    this.formGroup.enable();
    this.LeftMenu.operationState = true;
    console.log('修改');
    this._appService.editState = true;
  }
  onDelete(data) {
    console.log('删除');
    this._servers.modal('删除项目', `确定要删除项目，项目下的所有内容都会被删除！`,
      () => {
        this._servers.delete(`${baseUri}/${this.LeftMenu.titleId}`).subscribe(r => {
          if (r.state) {
            console.log(r);
            this.LeftMenu.titleId = null;
            this.LeftMenu.getMenuData();
            this._servers.showMessage('success', '删除完成！');
          }
        });
      });
  }
  onCloud() {
    console.log('云');
  }
  onSave() {
    console.log('保存');
    // tslint:disable-next-line:forin
    for (const key in this.formGroup.controls) {
      this.formGroup.controls[key].markAsDirty();
      this.formGroup.controls[key].updateValueAndValidity();
    }
    if (this.formGroup.valid) {
      let http = 'post';
      let message = { success: '项目添加', error: '项目名称' };
      let url = baseUri;
      if (this.nowProjectData) {
        http = 'put';
        message = { success: '项目修改', error: '项目名称' };
        url = `${baseUri}/${this.nowProjectData.id}`;
      } else {
      }
      this._servers.http(http, newFormData(this.formGroup.value), url, message).subscribe(r => {
        if (r.state) {
          console.log(r);
          if (r.data.message) {
            this.formGroup.disable();
            this.LeftMenu.operationState = false;
            this.LeftMenu.titleId = r.data.data.id;
            this.LeftMenu.getMenuData();
            setFormValue(r.data.data, this.formGroup);
            this._appService.editState = false;
          } else {
          }
        }
      });
    }
  }
  onCancel() {
    console.log('取消');
    if (this.nowProjectData) {
      setFormValue(this.nowProjectData, this.formGroup);
    } else {
      this.newForm();
    }
    this.formGroup.disable();
    this.LeftMenu.operationState = false;
    this._appService.editState = false;
  }
}
