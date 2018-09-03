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
import { Task, CopyTask } from '../../model/task.model';
import { Record } from '../../model/record.model';
import { publicDecrypt } from 'crypto';
import { AuthorityService } from '../../services/authority.service';

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
  ) { }

  ngOnInit() {
    const form = constructFormData();
    this.formGroup = form.formGroup;
    this.formTypes = form.formTypes;
    this.formGroup.disable(); // 输入框禁止编辑状态
    this.newForm();
    this._activatedRoute.params.subscribe(params => {
      console.log('路由', params, this.LeftMenu.menus, params.componentId);
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
            this.selectHoleGroup = params.holeGroupId;
            if (this.dbData.device) {
              this.groupTaskElem.onSelectHoleRadio(params.holeGroupId);
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
    console.log(`${baseUri}/${this.LeftMenu.bridgeId}`);
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
  // 选择张拉孔组孔
  onSelectHoleRadio() {
    console.log('8888', this.selectHoleGroup);
    if (this.dbData) {
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
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaa', {
      mpa: this.groupTaskElem.countKM.mpa,
      kn: this.groupTaskElem.countKM.kn,
      stage: this.groupTaskElem.dbData.tensionStageValue,
      time: this.groupTaskElem.dbData.time
    });
    this.runTension.state = true;
    this.runTension.title = '数据处理中...';
    this._ms.setDevice((state) => {
      if (state) {
        const tensionData = this.groupTaskElem.dbData;
        localStorage.setItem('nowDevice', this.dbData.deviceId);
        this.runTension.mode = deviceModes[tensionData.mode];
        for (const name of this.runTension.mode) {
          console.log(name);
          if (!this._ms.state[name] || this._ms.showValues[name].alarmNumber !== 0) {
            this.runTension.title = '设备状态有误，请检查设备！';
            this.runTension.alarmState = true;
            return;
          }
        }
        this.runTension.alarmState = false;
        const twiceData = this.getTwice(); // 二次张拉数据
        const nowTensionData = {
          id: tensionData.id,
          holeName: tensionData.holeName,
          bridgeName: this.dbData.bridgeName,
          mode: tensionData.mode,
          modes: this.runTension.mode,
          twice: this.groupTaskElem.nowTaskData.twice, // 二次张拉
          repeatedly: twiceData.recordData !== null,
          mpaPLC: {
            // a1: [],
            // b1: [],
            // a2: [],
            // b2: [],
          },
          // timePLC: [],
          checkData: {
            mpa: this.groupTaskElem.countKM.mpa,
            kn: this.groupTaskElem.countKM.kn,
            stage: this.groupTaskElem.dbData.tensionStageValue,
            time: this.groupTaskElem.dbData.time
          },
          stage: twiceData.stage,
          taskSum: {}
        };
        const recordData: Record = {
          id: this.dbData.id,
          parentId: this.dbData.projectId,
          operatorId: this._authority.user.id,
          state: 0,
          stage: 0,
          time: [],
          mode: tensionData.mode,
          mpa: {},
          mm: {},
          cvsData: {
            time: [],
            mpa: {},
            mm: {},
            mark: {
              index: [],
              doc: [],
            }
          },
          returnStart: {},
        };
        console.log('张拉数据', recordData);
        for (const name of this.runTension.mode) {
          recordData.mm[name] = [];
          recordData.mpa[name] = [];
          recordData.cvsData.mpa[name] = [];
          recordData.cvsData.mm[name] = [];
          nowTensionData.mpaPLC[name] = [];
          // recordData.liveCvs.push({time: new Date().getTime(), type: name, value: 0});
          for (const mpa of tensionData.mpa[name]) {
            nowTensionData.mpaPLC[name].push(this._ms.Value2PLC(mpa, 'mpa', name));
            nowTensionData.taskSum[name] = this.groupTaskElem.nowSumData[name];
            recordData.mm[name].push(0);
            recordData.mpa[name].push(0);
            recordData.returnStart[name] = { mpa: 0, mm: 0 };
          }
        }

        let liveState = [];
        switch (Number(this.groupTaskElem.nowTaskData.tensionStage)) {
          case 3:
            liveState = ['初张拉', '阶段一', '终张拉'];
            recordData.time = [0, 0, 0];
            break;
          case 4:
            if (twiceData.TwiceStage === 1) {
              liveState = ['初张拉', '阶段一', '阶段二'];
            } else {
              liveState = ['初张拉', '阶段一', '阶段二', '终张拉'];
            }
            recordData.time = [0, 0, 0, 0];
            break;
          case 5:
            liveState = ['初张拉', '阶段一', '阶段二', '阶段三', '终张拉'];
            recordData.time = [0, 0, 0, 0, 0];
            break;
          default:
            break;
        }

        console.log(Number(this.groupTaskElem.nowTaskData.tensionStage), liveState, '555555555555555555555555');
        if (this.groupTaskElem.nowTaskData.super) {
          recordData.time.push(0);
          if (twiceData.TwiceStage !== 1 && twiceData.TwiceStage !== 4) {
            liveState.push('超张拉');
            nowTensionData.stage += 1;
          }
        }
        if (twiceData.recordData) {
          Object.assign(recordData, twiceData.recordData);
        }
        if (twiceData.TwiceStage === 2 && twiceData.recordData.state === 2) {
          recordData.time[2] = 0;
        }
        // for (const time of tensionData.time) {
        //   nowTensionData.timePLC.push(time * 10);
        // }
        localStorage.setItem('nowTensionData', JSON.stringify(nowTensionData));
        console.log('张拉数据', tensionData, nowTensionData, recordData, liveState);
        this._ms.recordData = recordData;
        this._ms.tensionData = nowTensionData;
        this._ms.liveState = liveState;
        this.runTension.title = '数据处理完成！';
        setTimeout(() => {
          this._router.navigate(['/tension']);
        }, 500);
      } else {
        console.log('设备链接异常');
      }
    });
  }
  getTwice() {
    const gData = this.groupTaskElem.nowTaskData;
    const rData = this.groupTaskElem.recordData;
    let stage = 0;
    let TwiceStage = 0;
    if (gData.twice) {
      if (rData !== null && (rData.state === 2 || rData.stage === 3)) {
        stage = Number(gData.tensionStage) - 1;
        TwiceStage = 2;
      } else {
        TwiceStage = 1;
        stage = 2;
      }
    } else {
      stage = Number(gData.tensionStage) - 1;
    }
    return { stage: stage, recordData: rData, TwiceStage: TwiceStage };
  }
  runTensionOk() {
    this.onTension();
  }
  onSearch(value: string) {
    this.searchData = this.LeftMenu.bridges.filter(b => b.name.indexOf(value) !== -1);
  }
  onExportRecord(state = false) {
    const rData = this.groupTaskElem;
    console.log(rData.recordData, rData.nowTaskData);
    if (!state) {
      this.exportRecord.state = true;
    } else if (this.exportRecord.templatePath && this.exportRecord.savePath) {
      if (this._electronService.isElectronApp) {
        const data = [
          { name: 'N1', kh: 'A1' },
          { name: 'N1', kh: 'A2' },
          { name: 'N2', kh: 'B1' },
          { name: 'N2', kh: 'B2' },
        ];
        this._electronService.ipcRenderer.send('exportRecord',
          { templatePath: this.exportRecord.templatePath, savePath: this.exportRecord.savePath, data: data });
        this._electronService.ipcRenderer.on('exportRecordOK', (event, msg) => {
          this.exportRecord.msg = msg;
        });
      } else {
        console.log('只能在Electron中使用');
      }
    }
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
