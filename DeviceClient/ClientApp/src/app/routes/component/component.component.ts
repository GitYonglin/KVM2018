import { Component, OnInit, ViewChild } from '@angular/core';
import { LeftMenuComponent } from '../../shared/left-menu/left-menu.component';
import { FormGroup } from '@angular/forms';
import { APIService } from '../../services/api.service';
import { setFromValue } from '../../utils/form/construct-form';
import { getFormData, upDataFormData } from '../../utils/form/constructor-FormData';
import { constructFormData, holeFormData } from './form.data';
import { ModalFormDataComponent } from '../../shared/form/modal-form-data/modal-form-data.component';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../app.service';

@Component({
  selector: 'app-component',
  templateUrl: './component.component.html',
  styleUrls: ['./component.component.less']
})
export class ComponentComponent implements OnInit {
  @ViewChild(LeftMenuComponent)
  private LeftMenu: LeftMenuComponent;
  // @ViewChild('inputElement') holeEditElement: ModalFormDataComponent;
  @ViewChild(ModalFormDataComponent)
  private holeEditElement: ModalFormDataComponent;

  formGroup: FormGroup;
  formTypes: any;
  nowProjectData: any;
  nowEditData: any;
  holeData = [];

  constructor(
    private _servers: APIService,
    private _activatedRoute: ActivatedRoute,
    private _appService: AppService,
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
  //   thi
  }
  newForm() {
    const form = constructFormData();
    this.formGroup = form.formGroup;
    this.formTypes = form.formTypes;
  }
  /**
   *菜单切换
   *
   * @memberof ProjectComponent
   */
  menuSwitch() {
    this._servers.get(`/component/${ this.LeftMenu.titleId}`).subscribe(r => {
      console.log(r);
      this.nowProjectData = r;
      this.holeData = r.holes;
      this.formGroup.disable();
      this.LeftMenu.operationState = false;
      setFromValue(r, this.formGroup);
      // this.LeftMenu.titleId = id;
    });
  }
  operation(name) {
    this[name]();
  }
  onAdd() {
    this._appService.setGoUrl('/component', { id: null });
  }
  add() {
    console.log('添加');
    this.newForm();
    this.nowProjectData = null;
    this.holeData = null;
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
        this._servers.delete(`/component/${this.LeftMenu.titleId}`).subscribe(r => {
          if (r.state) {
            console.log(r);
            this.LeftMenu.titleId = null;
            this.LeftMenu.getMenuData();
            this.holeData = null;
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
      let url = '/component';
      if (this.nowProjectData) {
        http = 'put';
        message = { success: '项目修改', error: '项目名称' };
        url = `/component/${this.nowProjectData.id}`;
      } else {
      }
      this._servers.http(http, getFormData(this.formGroup.value), url, message).subscribe(r => {
        if (r.state) {
          console.log(r);
          if (r.data.message) {
            this.formGroup.disable();
            this.LeftMenu.operationState = false;
            this.LeftMenu.titleId = r.data.data.id;
            this.LeftMenu.getMenuData();
            setFromValue(r.data.data, this.formGroup);
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
      setFromValue(this.nowProjectData, this.formGroup);
    } else {
      this.newForm();
    }
    this.formGroup.disable();
    this.LeftMenu.operationState = false;
    this._appService.editState = false;
  }
  holeEdit(data = null) {
    this.nowEditData = JSON.parse(JSON.stringify(data));
    const form = holeFormData(data);
    console.log(form);
    this.holeEditElement.title = '孔号编辑';
    this.holeEditElement.formGroup = form.formGroup;
    this.holeEditElement.formTypes = form.formTypes;
    this.holeEditElement.isVisible = true;
  }
  outClose(data) {
    console.log(data);
    // this.nowEditData = JSON.parse(JSON.stringify(data)) || {};
    // // this.nowEditData = this.nowEditData || {};
    // const d = Object.assign({}, this.nowEditData, data);
    this.holeEditElement.isVisible = false;
    let fd = new FormData;
    let http = 'post';
    let url = '/hole';
    let message = { success: '孔添加', error: '孔名称' };
    if (this.nowEditData) {
      http = 'put';
      url = `${url}/${this.nowEditData.id}`;
      message = { success: '孔修改', error: '孔名称' };
      fd = upDataFormData(data, this.nowEditData);
    } else {
      fd = getFormData(data);
      fd.append('parentId', this.LeftMenu.titleId);
    }
    this._servers.http(http, fd, url, message).subscribe(r => {
      console.log(r);
      if (r.state) {
        this.holeData = r.data.data;
      }
    });
  }
  holeDelete(data) {
    this._servers.modal('删除孔', `确定要删除---${data.sName}`,
    () => {
      this._servers.delete(`/hole/${data.id}`).subscribe(r => {
        if (r.state) {
          console.log(r);
          this._servers.showMessage('success', r.data ? `孔完成！` : '删除错误！');
          this.holeData = r.data;
        }
      });
    });
  }
}

