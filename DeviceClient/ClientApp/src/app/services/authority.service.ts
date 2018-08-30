import { Injectable } from '@angular/core';

const menuArr = [
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

@Injectable({ providedIn: 'root' })
export class AuthorityService {
  public fullMenu: any[];

  menus() {
    if (JSON.parse(localStorage.getItem('project') || null)) {
      this.fullMenu = [{
        name: '任务',
        icon: 'anticon-profile',
        url: `/task`
      }, ...menuArr];
    } else {
      this.fullMenu = menuArr;
    }
    const user = JSON.parse(sessionStorage.getItem('user'));
    console.log(user, JSON.parse(localStorage.getItem('project')));
    if (!user.super) {
      this.fullMenu = this.fullMenu.filter(m => user.menuAuthority.indexOf(m.url) > -1);
    }
    console.log('过滤菜单', this.fullMenu);
  }
}
