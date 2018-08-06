import { Component, OnInit, ViewChild } from '@angular/core';
// import { operatorFormData, supervisionFormData, steelStrandFormData } from './edit-person/form.data';
import { APIService } from '../../services/api.service';
import { constructFormData, operatorFormData, supervisionFormData, steelStrandFormData  } from './form.data';
import { FormGroup } from '@angular/forms';
import { newFormData, upDataFormData } from '../../utils/form/constructor-FormData';
import { LeftMenuComponent } from '../../shared/left-menu/left-menu.component';
import { setFromValue } from '../../utils/form/construct-form';
import { ModalFormDataComponent } from '../../shared/form/modal-form-data/modal-form-data.component';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../app.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.less']
})
export class ProjectComponent implements OnInit {
  @ViewChild(LeftMenuComponent)
  private LeftMenu: LeftMenuComponent;
  // @ViewChild(EditPersonComponent)
  // private editOther: EditPersonComponent;
  @ViewChild(ModalFormDataComponent)
  private editOther: ModalFormDataComponent;

  formGroup: FormGroup;
  formTypes: any;
  nowProjectData: any;
  nowEditData: any;
  tabIndex = 0;
  operatorData = [];
  supervisionData = [];
  steelStrandData = [];

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
    this._servers.get(`/project/${this.LeftMenu.titleId}`).subscribe(r => {
      console.log(r);
      this.nowProjectData = r;
      this.operatorData = r.operators;
      this.supervisionData = r.supervisions;
      this.steelStrandData = r.steelStrands;
      this.formGroup.disable();
      this.LeftMenu.operationState = false;
      setFromValue(r, this.formGroup);
    });
  }
  operation(name) {
    this[name]();
  }
  onAdd() {
    this._appService.setGoUrl('/project', { id: null });
  }
  add() {
    console.log('添加');
    this.newForm();
    this.nowProjectData = null;
    this.operatorData = null;
    this.supervisionData = null;
    this.steelStrandData = null;
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
        this._servers.delete(`/project/${this.LeftMenu.titleId}`).subscribe(r => {
          if (r.state) {
            console.log(r);
            this.LeftMenu.titleId = null;
            this.LeftMenu.getMenuData();
            this.operatorData = null;
            this.supervisionData = null;
            this.steelStrandData = null;
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
      let url = '/project';
      if (this.nowProjectData) {
        http = 'put';
        message = { success: '项目修改', error: '项目名称' };
        url = `/project/${this.nowProjectData.id}`;
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
  tabSelect(n) {
    console.log(n);
    this.tabIndex = n;
  }
  onAddTab(value = null) {
    console.log(this.tabIndex);
    this.nowEditData = JSON.parse(JSON.stringify(value));
    this.editOther.isVisible = true;
    const editFormData = [
      { form: operatorFormData(value), title: '操作员' },
      { form: supervisionFormData(value), title: '监理' },
      { form: steelStrandFormData(value), title: '钢绞线' },
    ];
    this.editOther.title = editFormData[this.tabIndex].title;
    this.editOther.formGroup = editFormData[this.tabIndex].form.formGroup;
    this.editOther.formTypes = editFormData[this.tabIndex].form.formTypes;
  }
  editCancel(data) {
    this.editOther.isVisible = false;
    this.nowEditData = this.nowEditData || {};
    if (data) {
      const d = Object.assign({}, this.nowEditData, data);
      console.log('编辑返回的数据', d, this.nowEditData);
      const editSaveData = [
        {
          url: '/operator', msg: [{ success: '操作员添加', error: '操作员名称' }, { success: '操作员修改', error: '操作员名称' }], callback: (r) => {
            this.operatorData = r.data.data;
          }
        },
        {
          url: '/supervision', msg: [{ success: '监理添加', error: '监理名称' }, { success: '监理修改', error: '监理名称' }], callback: (r) => {
            this.supervisionData = r.data.data;
          }
        },
        {
          url: '/steelStrand', msg: [{ success: '钢绞线添加', error: '钢绞线名称' }, { success: '钢绞线修改', error: '钢绞线名称' }], callback: (r) => {
            this.steelStrandData = r.data.data;
          }
        },
      ];
      this.editSave(d, editSaveData[this.tabIndex].url, editSaveData[this.tabIndex].msg, editSaveData[this.tabIndex].callback);
    } else {
    }
  }
  editSave(data, uri: string, msg: any, callback: Function) {
    let fd = new FormData;
    let http = 'post';
    let url = uri;
    let message = msg[0];
    if ('id' in data) {
      http = 'put';
      url = `${url}/${this.nowEditData.id}`;
      message = msg[1];
      fd = upDataFormData(data, this.nowEditData);
    } else {
      fd = newFormData(data);
      fd.append('parentId', this.LeftMenu.titleId);
    }
    this._servers.http(http, fd, url, message).subscribe(r => {
      console.log(r);
      if (r.state) {
        callback(r);
      }
    });
  }
  otherDelete(data) {
    const deleteData = [
      { title: '删除角色', url: '/operator', callback: (r) => { this.operatorData = r.data; } },
      { title: '删除监理', url: '/supervision', callback: (r) => { this.supervisionData = r.data; }  },
      { title: '删除钢绞线', url: '/steelStrand', callback: (r) => { this.steelStrandData = r.data; }  },
    ];
    this._servers.modal(deleteData[this.tabIndex].title, `确定要删除---${data.sName}`,
      () => {
        this._servers.delete(`${deleteData[this.tabIndex].url}/${data.id}`).subscribe(r => {
          if (r.state) {
            console.log(r);
            this._servers.showMessage('success', r.data ? `${deleteData[this.tabIndex].title}完成！` : '删除错误！');
            // this.operatorData = r.data;
            deleteData[this.tabIndex].callback(r);
          }
        });
      });
  }
}
