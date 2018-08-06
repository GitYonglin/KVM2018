import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { AppService } from '../../routes/app.service';

const menuArr = [
  // {
  //   name: '任务',
  //   icon: 'anticon-profile',
  //   url: `/task`
  // },
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
    icon: 'anticon-ie',
    url: '/deviceSet'
  },
  {
    name: '帮助',
    icon: 'anticon-question',
    url: '/manual'
  },
  {
    name: '监控',
    icon: 'anticon-ie',
    url: '/tension'
  },
  {
    name: '手动',
    icon: 'anticon-question',
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
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.url = this._router.url;
    console.log(this._router.url);
  }
  showModal(): void {
    let url = this._router.url;
    console.log(url, JSON.parse(localStorage.getItem('project')));
    if (url.indexOf(';') !== -1) {
      url = url.match(/(\S*);/)[1];
    }
    this.url = url;
    if (JSON.parse(localStorage.getItem('project')) != null && 'id' in JSON.parse(localStorage.getItem('project'))) {
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
}
