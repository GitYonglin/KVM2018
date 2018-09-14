import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { AppService } from '../../routes/app.service';
import { AuthorityService } from '../../services/authority.service';
import { ElectronService } from 'ngx-electron';

const menuArr = [
  // {
  //   name: '任务',
  //   icon: 'anticon-profile',
  //   url: `/task`
  // },<i class="anticon anticon-setting"></i><i class="anticon anticon-dashboard"></i>
  {
    name: '构件',
    icon: 'anticon-api',
    url: '/component'
  },
  {
    name: '项目',
    icon: 'anticon-database',
    url: '/project'
  },
  {
    name: '设备',
    icon: 'anticon-tool',
    url: '/device'
  },
  {
    name: '设置',
    icon: 'anticon-setting',
    url: '/deviceSet'
  },
  {
    name: '帮助',
    icon: 'anticon-question',
    url: '/help'
  },
  {
    name: '手动',
    icon: 'anticon-dashboard',
    url: '/manual'
  },
];
@Component({
  selector: 'app-full-menu',
  templateUrl: './full-menu.component.html',
  styleUrls: ['./full-menu.component.less']
})
export class FullMenuComponent implements OnInit {
  menus = [];
  url: string;

  @Input()
    isVisible = false;

  @Output()
    cancel = new EventEmitter<any>();

  constructor(
    private _router: Router,
    private modal: NzModalService,
    private _appServe: AppService,
    private _cdr: ChangeDetectorRef,
    public _authority: AuthorityService,
    private _electronService: ElectronService,
  ) { }

  ngOnInit() {
    this.url = this._router.url;
    console.log(this._router.url);
  }
  showModal(): void {
    let url = this._router.url;
    if (url.indexOf(';') !== -1) {
      url = url.match(/(\S*);/)[1];
    }
    this.url = url;
    if (JSON.parse(localStorage.getItem('project') || null)) {
      this.menus = [{
        name: '任务',
        icon: 'anticon-profile',
        url: `/task`
      }, ...menuArr];
    } else {
      this.menus = menuArr;
    }
    // this._cdr.checkNoChanges();
    console.log(this.menus);
    this.isVisible = true;
    this.cancel.emit();
  }

  handleOk(): void {
    console.log('Button ok clicked!');
    this.isVisible = false;
    this.cancel.emit();
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
    this.cancel.emit();
  }

  go(url) {
    this.isVisible = false;
    this.modal.closeAll();
    this.url = url;
    this._appServe.goUrl = url;
    // this.handleCancel();
    if (url === '/task') {
      this._router.navigate([url, {id: JSON.parse(localStorage.getItem('project')).id}]);
    } else {
      this._router.navigate([url]);
    }
    console.log(url, this.modal.openModals);
  }
  restart() {
    this.modal.create({
      nzTitle: '重启',
      nzContent: '重启',
      nzClosable: true,
      nzOnOk: () => {
        this._electronService.ipcRenderer.send('restart');
      }
    });
  }
  off() {
    this.modal.create({
      nzTitle: '关机',
      nzContent: '关机',
      nzClosable: true,
      nzOnOk: () => {
        this._electronService.ipcRenderer.send('off');
      }
    });
  }
}
