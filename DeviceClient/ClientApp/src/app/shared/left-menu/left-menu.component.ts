import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { listAnim } from '../../animas/list.anim';
import { APIService } from '../../services/api.service';
import { Router } from '@angular/router';
import { AppService } from '../../routes/app.service';
import { MSService } from '../../services/MS.service';

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.less'],
  animations: [ listAnim ]
})
export class LeftMenuComponent implements OnInit {
  indexActive = -1;
  titleId = null;
  bridgeId: any;
  menus = [];
  bridges: any;
  bridgeItem: any;
  menuDataState = false;
  operationState = false;
  componentId = null;
  deviceLinkZ = '主站';
  deviceLinkC = '从站';

  @Input() disabledState = false;
  @Output() operation = new EventEmitter<string>();
  @Output() menuSwitch = new EventEmitter<string>();

  constructor(
    private _service: APIService,
    private _router: Router,
    private _appService: AppService,
    public _ms: MSService
  ) { }

  ngOnInit() {
    this.menuDataState = false;
    this.getMenuData();
    this.deviceLinkZ = this._ms.deviceLinkZ;
    this.deviceLinkC = this._ms.deviceLinkC;
  }

  getMenuData() {
    let url = this._router.url;
    if (url.indexOf(';') !== -1) {
      url = url.match(/(\S*);/)[1];
    }
    if (url.indexOf('/task') !== -1) {
      url = `/task/menu/${JSON.parse(localStorage.getItem('project')).id}`;
    }
    this._service.get(url).subscribe(p => {
      console.log('000000000', p);
      if (p) {
        this.menus = p.length === 0 ? null : p;
        // this.menuDataState = p ? true : false;
        this.menuDataState = p && p.length > 0 && 'count' in p[0];
        console.log('菜单数据', p, this.menuDataState);
        if (url.indexOf('/task') !== -1 && this.titleId !== null) {
          this.getBridges(this.titleId, this.indexActive);
          this.bridgeItem = this.menus.filter(m => m.id === this.titleId)[0];
        }
      } else {
        this.menus = null;
      }
    });
  }
  getBridges(id, index = this.indexActive) {
    let url = this._router.url;
    if (url.indexOf('/task') !== -1) {
      url = `/task/menu/bridges/${JSON.parse(localStorage.getItem('project')).id}/${id}`;
    }
    console.log(id, url);
    this._service.get(url).subscribe(r => {
      console.log('000000000', r);
      if (r) {
        this.bridges = r;
        this.indexActive = index;
      } else {
        this.bridges = null;
      }
    });
  }

  onMenu1(index, item) {
    const id = item.id;
    // this.titleId = id;
    this.bridgeId = null;
    let url = this._router.url;
    if (url.indexOf(';') !== -1) {
      url = url.match(/(\S*);/)[1];
    }
    if ('count' in this.menus[0] && index === this.indexActive) {
      this.indexActive = -1;
      this.titleId = null;
      if (url.indexOf('/task') !== -1) {
        this.goUrl('/task', {id: JSON.parse(localStorage.getItem('project')).id});
        this.bridges = null;
      } else {
        this.goUrl(url);
      }
    } else {
      if ('count' in this.menus[0]) {
        console.log('二级菜单', id);
        this.bridgeItem = item;
        this.goUrl('/task', {id: JSON.parse(localStorage.getItem('project')).id, componentId: item.id});
        this.getBridges(id, index);
      } else {
        this.goUrl(url, {id: item.id});
        this.indexActive = index;
        // this.menuSwitch.emit(id);
      }
    }
    console.log('menu点击--', id, url, this._router);
  }
  onBridge(id) {
    console.log(id);
    // this.bridgeId = id;
    this.goUrl('/task', { id: JSON.parse(localStorage.getItem('project')).id, componentId: this.titleId, bridgeId: id});
    // this.menuSwitch.emit(id);
  }
  onOperation(name) {
    this.operation.emit(name);
  }
  goUrl(url, data = null) {
    this._appService.goUrl = {url: url, data: data};
    console.log('484848', url);
    this._router.navigate([url, data]);
  }

}
