import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { APIService } from '../../services/api.service';
import { LeftMenuComponent } from '../../shared/left-menu/left-menu.component';
import { FormGroup } from '@angular/forms';
import { constructFormData, constructHoleFromGroup, setHoleFormValue, otherFormGroup } from './form.data';
import { setFromValue } from '../../utils/form/construct-form';
import { SelectComponentComponent } from './select-component/select-component.component';
import { SelectDeviceComponent } from './select-device/select-device.component';
import { ManualGroupComponent } from './manual-group/manual-group.component';
import { SelectSteelStrandComponent } from './select-steel-strand/select-steel-strand.component';
import { GroupTaskDataComponent } from './group-task-data/group-task-data.component';
import { AppService } from '../app.service';
import { ActivatedRoute, NavigationStart } from '@angular/router';
import { Router } from '@angular/router';
import { MSService } from '../../services/MS.service';
import { deviceModes } from '../../model/device.model';
import { Http, Headers } from '@angular/http';
import { ElectronService } from 'ngx-electron';
import { Task, CopyTask, HoleGroup } from '../../model/task.model';
import { Record } from '../../model/record.model';
import { publicDecrypt } from 'crypto';
import { AuthorityService } from '../../services/authority.service';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { GetAutoData } from '../../utils/autoTension';
import { exportData } from '../../utils/export';

const baseUri = '/task';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.less']
})
export class TaskComponent implements OnInit, AfterViewInit {
  @ViewChild(LeftMenuComponent)
  private LeftMenu: LeftMenuComponent;
  @ViewChild(SelectComponentComponent)
  private selectComponentElem: SelectComponentComponent;
  @ViewChild(SelectDeviceComponent)
  private selectDeviceElem: SelectDeviceComponent;
  @ViewChild(ManualGroupComponent)
  private manualElem: ManualGroupComponent;
  @ViewChild(SelectSteelStrandComponent)
  private steelStrandElem: SelectSteelStrandComponent;
  @ViewChild(GroupTaskDataComponent)
  private groupTaskElem: GroupTaskDataComponent;

  formGroup: FormGroup;
  formTypes: any;
  otherFormGroup = otherFormGroup;
  dbData: Task;
  nowComponent: any;
  nowHole: any;
  // nowDevice: any;
  nowSteelStrand: any;
  holeGroups: any;
  tabIndex = 0;
  manualState = false;
  selectHoleGroup = null;
  copyState = false;
  runTension = {
    alarmState: false,
    state: false,
    mode: null,
    title: '',
    deviceState: false,
  };
  inputValue: string;
  searchData = [];
  exportRecord = {
    state: false,
    msg: '',
    templatePath: '',
    savePath: ''
  };
  holeId: any;
  selectDeviceMode: any;

  constructor(
    private _servers: APIService,
    public _appService: AppService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    public _ms: MSService,
    private _http: Http,
    private _electronService: ElectronService,
    private _authority: AuthorityService,
    private modalService: NzModalService,
    private message: NzMessageService,
  ) { }

  ngOnInit() {
    const form = constructFormData();
    this.formGroup = form.formGroup;
    this.formTypes = form.formTypes;
    this.formGroup.disable(); // 输入框禁止编辑状态
    this.newForm();
    this._activatedRoute.params.subscribe(params => {
      console.log('路由7897987978978978978979878979', params, this.LeftMenu.menus, params.componentId);
      if ('componentId' in params) {
        if (this.LeftMenu.titleId !== params.componentId) {
          this.LeftMenu.titleId = params.componentId;
        }
        if ('bridgeId' in params) {
          if (this.LeftMenu.bridgeId !== params.bridgeId && params.bridgeId !== 'null') {
            this.LeftMenu.bridgeId = params.bridgeId;
            this.selectHoleGroup = null;
            this.menuSwitch();
          } else if (params.bridgeId === 'null') {
            this.onAdd();
          }
          if ('holeGroupId' in params) {
            try {
              this.selectHoleGroup = params.holeGroupId;
              if (this.dbData.device) {
                this.groupTaskElem.onSelectHoleRadio(params.holeGroupId);
              }
            } catch (error) {
            }
          }
        }
      }
    });
  }
  ngAfterViewInit() {
  }
  newForm() {
    // tslint:disable-next-line:forin
    for (const key in this.formGroup.controls) {
      this.formGroup.controls[key].setValue(null);
    }
  }
  /**
   *菜单切换
   *
   * @memberof ProjectComponent
   */
  menuSwitch() {
    console.log('任务路由切换', `${baseUri}/${this.LeftMenu.bridgeId}`);
    this._servers.get(`${baseUri}/${this.LeftMenu.bridgeId}`).subscribe(r => {
      this.dbData = r;
      console.log('切换梁数据', r, this.dbData.component);
      const fData = {
        componentName: this.dbData.component.sName,
        holeName: this.dbData.hole.sName,
        deviceName: this.dbData.device.sName,
        steelStrandName: this.dbData.steelStrand.sName,
      };
      ['bridgeName', 'skNumber', 'skIntensity', 'designIntensity', 'tensionIntensity', 'concretingDate', 'friction'].map( key => {
        fData[key] = this.dbData[key];
      });
      setFromValue(fData, this.formGroup);
      this.groupTaskElem.holeGroupId = null;
      this.formGroup.disable();
      this.LeftMenu.operationState = false;
      this.copyState = false;
      if (this.selectHoleGroup) {
        this.groupTaskElem.onSelectHoleRadio(this.selectHoleGroup);
      }
    });
  }
  operation(name) {
    this[name]();
  }
  onAdd() {
    this.formGroup.enable();
    this._appService.editState = true;
    this.LeftMenu.bridgeId = null;
    this.groupTaskElem.holeGroupId = null;
    this.LeftMenu.operationState = true;
    this.selectHoleGroup = null;
    console.log('添加');
    this.newForm();
    this.dbData = {};
  }
  onModify() {
    this.formGroup.enable();
    this.formGroup.controls['componentName'].disable();
    this.formGroup.controls['holeName'].disable();
    this.formGroup.controls['deviceName'].disable();
    this.formGroup.controls['steelStrandName'].disable();
    this.LeftMenu.operationState = true;
    console.log('修改');
    this._appService.editState = true;
  }
  onDelete(data) {
    console.log('删除');
    this._servers.modal('删除项目', `确定要删除项目，项目下的所有内容都会被删除！`,
      () => {
        this._servers.delete(`${baseUri}/${this.LeftMenu.bridgeId}`).subscribe(r => {
          if (r.state) {
            console.log(r);
            this.LeftMenu.bridgeId = null;
            this.LeftMenu.getBridges(r.data.data.componentName, null);
            this._servers.showMessage('success', '删除完成！');
          }
        });
      });
  }
  onCloud() {
    console.log('云');
  }
  onSave() {
    console.log('保存', this.formGroup.valid, this.dbData, this.dbData.id);
    // tslint:disable-next-line:forin
    for (const key in this.formGroup.controls) {
      this.formGroup.controls[key].markAsDirty();
      this.formGroup.controls[key].updateValueAndValidity();
    }
    if (!this.formGroup.valid) {
      return;
    }
    let http = 'post';
    let message = { success: '任务添加', error: '任务名称' };
    let url = baseUri;
    const postData: Task = this.dbData;
    postData.projectId = JSON.parse(localStorage.getItem('project')).id;
    ['bridgeName', 'skNumber', 'skIntensity', 'designIntensity', 'tensionIntensity', 'concretingDate', 'friction'].map( key => {
      let value = this.formGroup.controls[key].value;
      if (key === 'concretingDate') {
        value = value.toString().replace('GMT+0800 (中国标准时间)', '');
      }
      postData[key] = value;
    });
    console.log('post数据', this.dbData, postData);
    let pd = {};
    // 复制梁
    if (this.copyState) {
      url = '/task/copy';
      ['bridgeName', 'projectId', 'id', 'componentId'].map(key => {
        pd[key] = postData[key];
      });
      message = { success: '复制任务', error: '任务名称' };
    } else {
      // 修改梁
      if (this.dbData && this.dbData.id) {
        http = 'put';
        message = { success: '任务修改', error: '任务名称' };
        // 新建梁
      } else {
        postData.holeGroups = this.groupTaskElem.nowTaskDataArr;
        console.log('post数据', postData, this.groupTaskElem.nowTaskDataArr);
      }
      pd = postData;
    }
    console.log('post', pd);
    this._servers.http(http, pd, url, message).subscribe(r => {
      if (r.state) {
        console.log(r);
        this._appService.editState = false;
        if (r.data.message) {
          this.formGroup.disable();
          this.LeftMenu.operationState = false;
          this.copyState = false;
          this.LeftMenu.titleId = r.data.data.componentId;
          this.LeftMenu.getMenuData();
          this.LeftMenu.onBridge(r.data.data.id);
          setFromValue(r.data.data, this.formGroup);
        } else {
        }
      } else {
      }
    });
  }
  onCancel() {
    console.log('取消');
    if (this.dbData && 'id' in this.dbData) {
      setFromValue(this.dbData, this.formGroup);
    } else {
      this.newForm();
    }
    this.formGroup.disable();
    this.LeftMenu.operationState = false;
    this.copyState = false;
    this._appService.editState = false;
    this._router.navigate(['/task', {
      id: JSON.parse(localStorage.getItem('project')).id
    }]);
    this.LeftMenu.getMenuData();
  }

  onSelectComponent() {
    console.log(this.LeftMenu.titleId, this.LeftMenu.bridgeItem);
    this.selectComponentElem.isVisible = true;
    if (this.LeftMenu.titleId) {
      this.selectComponentElem.nowComponentId = this.LeftMenu.titleId;
      this.selectComponentElem.selectItem = this.LeftMenu.bridgeItem;
      this.selectComponentElem.onSelect();
    }
  }
  outSelectComponent(data) {
    if (data) {
      this.dbData.componentId = data.componentId;
      this.dbData.holeId = data.hole.id;
      this.dbData.component = data;
      this.dbData.hole = data.hole;
      console.log('构建选择完成', data, this.dbData);
      if (data) {
        this.formGroup.controls['componentName'].setValue(data.componentName);
        this.formGroup.controls['holeName'].setValue(data.hole.sName);
      }
      this.grouping();
    }
    this.selectComponentElem.isVisible = false;
  }
  onSelectDevice() {
    this.selectDeviceElem.isVisible = true;
  }
  outSelectDevice(data) {
    if (data) {
      this.dbData.deviceId = data.device.id;
      this.dbData.device = data.device;
      this.selectDeviceMode = data.selectDeviceMode;
      console.log('设备选择完成', data, this.dbData);
      this.formGroup.controls['deviceName'].setValue(data.device.sName);
      this.grouping();
    }
    this.selectDeviceElem.isVisible = false;
  }
  grouping() {
    if (this.dbData.component && this.dbData.device) {
      const holes = this.dbData.hole.holes;
      const deviceMode = this.selectDeviceMode;
      const step = deviceMode === 4 ? 2 : 1;
      const holeGroups = [];
      console.log(holes.length, step);
      for (let index = 0; index < holes.length; index += step) {
        if (deviceMode === 4 && holes.length < index + step) {
          holeGroups.push({ mode: 1, hole: `${holes[index]}` });
        } else if (deviceMode === 4) {
          holeGroups.push({ mode: deviceMode, hole: `${holes[index]}/${holes[index + 1]}` });
        } else {
          holeGroups.push({ mode: deviceMode, hole: `${holes[index]}` });
        }
        console.log(holes[index]);
      }
      console.log('分组完成', holeGroups);
      this.holeGroups = holeGroups;
      this.dbData.holeGroupsRadio = holeGroups;
      this.groupTaskElem.constructHoleFormGroup(holeGroups);
    }
  }
  onManual() {
    console.log(this.dbData.hole.holes);
    this.manualElem.holes = this.dbData.hole.holes;
    this.manualElem.selectHole = this.dbData.hole.holes;
    this.manualElem.isVisible = true;
    this.manualElem.onHoleChange();
  }
  outManual(data) {
    this.manualElem.isVisible = false;
    console.log('手动分组完成', data);
    if (data) {
      this.holeGroups = data;
      // constructHoleFromGroup(data);
      this.groupTaskElem.constructHoleFormGroup(data);
    }
  }

  onSelectSteelStrand() {
    this.steelStrandElem.isVisible = true;
  }
  outSteelStrand(data) {
    if (data) {
      this.nowSteelStrand = data;
      this.dbData.steelStrandId = data.id;
      console.log('钢绞线选择完成', data, this.dbData);
      this.formGroup.controls['steelStrandName'].setValue(data.sName);
      this.steelStrandElem.isVisible = false;
    } else {
      this.steelStrandElem.isVisible = false;
    }
  }
  /** 切换孔 */
  onSelectHoleRadio() {
    if (this.dbData) {
      console.log('88888888888888888888888888888', this.selectHoleGroup, JSON.parse(localStorage.getItem('project')).id,
         this.LeftMenu.titleId, this.LeftMenu.bridgeId);
      this._router.navigate(['/task', {
        id: JSON.parse(localStorage.getItem('project')).id,
        componentId: this.LeftMenu.titleId,
        bridgeId: this.LeftMenu.bridgeId,
        holeGroupId: this.selectHoleGroup
      }]);
      // this.groupTaskElem.onSelectHoleRadio(this.selectHoleGroup);
    }
  }
  // 复制梁
  onCopy() {
    this.copyState = true;
    console.log('复制', this.dbData);
    // this.formGroup.controls['bridgeName'].setValue('');
    this.onModify();
  }
  // 张拉
  onTension() {
    this._ms.DF05(10, true); // 设备调整手动
    const dev = this._ms.Dev;
    this.runTension.deviceState = false;
    this.runTension.state = false;
    console.log('自动张拉数据', this.groupTaskElem.dbData, this.groupTaskElem.countKM);
    const dbTask = this.groupTaskElem.dbData;
    if (this._ms.nowDevice.id !== this.dbData.device.id) {
      this.runTension.deviceState = true;
    } else {
      this.runTension.state = true;
      this.runTension.title = '数据处理中...';
      // 检查设备连接状态
      this.runTension.mode = deviceModes[dbTask.task.mode];
      for (const name of deviceModes[dbTask.task.mode]) {
        if (!(dev[name] && dev[name].liveData.connectState && dev[name].liveData.alarmNumber === 0 && dev.a1.liveData.state === '待机')) {
          this.runTension.alarmState = true;
          console.log(this.runTension.mode);
          this.runTension.title = '设备状态有误，请检查设备！';
          return;
        }
      }
      const auto = new GetAutoData(dbTask.task, dbTask.record, this.groupTaskElem.countKM, this._ms.Dev);
      localStorage.setItem('autoData', JSON.stringify({
        task: auto.task,
        record: auto.record,
        data: auto.data,
        state: auto.state,
        sumData: auto.sumData,
        KMData: auto.KMData,
      }));
      this._router.navigate(['/tension'], { queryParams: { bridgeName: this.dbData.bridgeName} });
      // this._router.navigate(['/login'], { queryParams: user });
      console.log('auto', auto);
    }
  }
  // 设备不一致切换
  taskSelectDevice() {
    this._ms.setDevice(this.dbData.deviceId, (r) => {
      if (r) {
        this.message.create('success', `设备切换成功！`);
        this.onTension();
      } else {
        this.message.create('error', `设备切换错误！`);
      }
    });
  }
  runTensionOk() {
    this.onTension();
  }
  onSearch(value: string) {
    this.searchData = this.LeftMenu.bridges.filter(b => b.name.indexOf(value) !== -1);
  }
  /** 记录导出 */
  onExportRecord(state = false) {
    this._servers.get(`/task/export/${this.dbData.id}`).subscribe((d) => {
      console.log(d);
      const ed = exportData({holeData: d.holeGroups, record: d.records}, this.dbData.device);
      console.log(ed);
      if (!state) {
        this.exportRecord.state = true;
      } else if (this.exportRecord.templatePath && this.exportRecord.savePath) {
        if (this._electronService.isElectronApp) {
          const data = {
            project: {name: '测试'},
            tension: ed
          };
          this._electronService.ipcRenderer.send('exportRecord',
            { templatePath: this.exportRecord.templatePath, savePath: this.exportRecord.savePath, data: data });
          this._electronService.ipcRenderer.on('exportRecordOK', (event, msg) => {
            this.exportRecord.msg = msg;
          });
        } else {
          console.log('只能在Electron中使用');
        }
      }
    });
  }
  exportFilePath(t) {
    // console.log(file);
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('exportFilePath', t);
      this._electronService.ipcRenderer.on('exportFilePathOK', (event, data) => {
        if (data.t) {
          this.exportRecord.savePath = data.path;
        } else {
          this.exportRecord.templatePath = data.path;
        }
      });
    } else {
      console.log('只能在Electron中使用');
    }
  }
}
