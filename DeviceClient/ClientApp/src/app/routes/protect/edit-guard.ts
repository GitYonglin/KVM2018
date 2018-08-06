import { Injectable } from '@angular/core';
import { CanDeactivate, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { AppService } from '../app.service';

@Injectable()
export class ProtectEditGuard implements CanDeactivate<any> {
  constructor(
    private modalService: NzModalService,
    private _appService: AppService,
    private _router: Router
  ) { }
  canDeactivate() {
    const editState = this._appService.editState;
    const url = this._appService.goUrl;
    console.log(url, editState);
    if (editState) {
      this.modalService.create({
        nzTitle: '编辑中',
        nzContent: '你确定要放弃编辑吗？',
        nzClosable: false,
        nzOnOk: () => {
          this._appService.editState = false;
          this._router.navigate([url.url, url.data]);
          return true;
        }
      });
    } else {
      return true;
    }
  }
}
