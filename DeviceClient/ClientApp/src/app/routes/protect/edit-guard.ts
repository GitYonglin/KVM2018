import { Injectable } from '@angular/core';
import { CanDeactivate, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { AppService } from '../app.service';
import { Observable } from 'rxjs';

@Injectable()
export class ProtectEditGuard implements CanDeactivate<any> {
  constructor(
    private modalService: NzModalService,
    private _appService: AppService,
    private _router: Router
  ) { }
  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    const editState = this._appService.editState;
    const url = this._appService.goUrl;
    console.log(url, editState, this._router);
    return new Observable((observer) => {
    if (editState) {
        this.modalService.create({
          nzTitle: '编辑中',
          nzContent: '你确定要放弃编辑吗？',
          nzClosable: false,
          nzOnOk: () => {
            this._appService.editState = false;
            observer.next(true);
            observer.complete();
          }
        });
      } else {
        observer.next(true);
        observer.complete();
      }
    });
  }
}
