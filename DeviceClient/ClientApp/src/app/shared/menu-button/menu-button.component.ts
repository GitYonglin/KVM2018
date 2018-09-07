import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MSService } from '../../services/MS.service';
import { FullMenuComponent } from '../full-menu/full-menu.component';
import { LiveData } from '../../model/live';
import { AppService } from '../../routes/app.service';
import { NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-menu-button',
  templateUrl: './menu-button.component.html',
  styleUrls: ['./menu-button.component.less']
})
export class MenuButtonComponent implements OnInit {
  a1Visible = false;
  liveState: {z: {state: string, message: string}, c: {state: string, message: string}} = null;
  iTime = null;
  connectRadio: string;

  @Input()
    fullMenuState = true;
  @Input()
  logoutState = false;

  @ViewChild(FullMenuComponent)
    private FullMenu: FullMenuComponent;
  constructor(
    public _ms: MSService,
    private _app: AppService,
    private modalService: NzModalService,
  ) { }

  ngOnInit() {
    this.connectRadio = localStorage.getItem('connect');
    if (!this.iTime) {
      this.iTime = setInterval(() => {
        this.liveStateFunc();
      }, 1500);
    }
  }
  show() {
    this.a1Visible = true;
    this.connectRadio = localStorage.getItem('connect');
  }
  public showFullMenu() {
    this.FullMenu.showModal();
  }
  public liveStateFunc() {
    const a1: LiveData = this._ms.Dev.a1 ? this._ms.Dev.a1.liveData : null;
    const b1: LiveData = this._ms.Dev.b1 ? this._ms.Dev.b1.liveData : null;
    const a2: LiveData = this._ms.Dev.a2 ? this._ms.Dev.a2.liveData : null;
    const b2: LiveData = this._ms.Dev.b2 ? this._ms.Dev.b2.liveData : null;
    // console.log(this._ms.Dev, (!a2 || (a2.connectState && a2.alarmNumber === 0)));
    const zstate = (
      (!a1 || (a1.connectState && a1.alarmNumber === 0)) &&
      (!b1 || (b1.connectState && b1.alarmNumber === 0))
    ) ? 'primary' : 'danger';
    const cstate = (
      (!a2 || (a2.connectState && a2.alarmNumber === 0)) &&
      (!b2 || (b2.connectState && b2.alarmNumber === 0))
    ) ? 'primary' : 'danger';

    this.liveState = {
      z: {
        state: zstate,
        message: a1 ? a1.connectMsg : b1 ? b1.connectMsg : null
      },
      c: {
        state: cstate,
        message: a2 ? a2.connectMsg : b2 ? b2.connectMsg : null
      },
    };
  }
  onConnect(e) {
    console.log(e);
    if (this._app.editState) {
      this.modalService.create({
        nzTitle: '编辑中',
        nzContent: '正在编辑中...，先完成编辑操作！',
        nzClosable: true,
        nzOnOk: () => {
          this.connectRadio = this.connectRadio === '1' ? '2' : '1';
        }
      });
    } else {
      this.modalService.create({
        nzTitle: '联机模式修改',
        nzContent: '切换联机模式需要重新登陆，确定切换并重新登陆吗？',
        // nzClosable: false,
        nzOnOk: () => {
          this._app.editState = false;
          localStorage.setItem('connect', e);
          // this._ms.connection.invoke('Creates', e === '2');
          window.location.href = '/';
        },
        nzOnCancel: () => {
          this.connectRadio = this.connectRadio === '1' ? '2' : '1';
        }
      });
    }
  }
  goLogin() {
    if (this._app.editState) {
      this.modalService.create({
        nzTitle: '编辑中',
        nzContent: '修改了数据，但没有保存，确定放弃修改吗？',
        nzClosable: false,
        nzOnOk: () => {
          this._app.editState = false;
          window.location.href = '/';
        }
      });
    } else {
      window.location.href = '/';
    }
  }
}
