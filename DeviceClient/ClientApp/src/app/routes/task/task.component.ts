import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { APIService } from '../../services/api.service';
import { LeftMenuComponent } from '../../shared/left-menu/left-menu.component';
import { FormGroup } from '@angular/forms';
import { newFormData, getFormData } from '../../utils/form/constructor-FormData';
import { constructFormData, constructHoleFromGroup, setHoleFormValue } from './form.data';
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
import { RecordData } from '../../model/live.model';
import { Http, Headers } from '@angular/http';

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
  nowData: any;
  nowComponent: any;
  nowDevice: any;
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

  constructor(
    private _servers: APIService,
    private _appService: AppService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    public _ms: MSService,
    private _http: Http,
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
            this.add();
          }
          if ('holeGroupId' in params) {
            this.selectHoleGroup = params.holeGroupId;
            if (this.nowDevice) {
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
      console.log('切换梁数据', r);
      setFromValue(r, this.formGroup);
      this.nowData = r;
      this.nowDevice = { device: r.device };
      this.holeGroups = r.holeGroupsRadio;
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
    this._router.navigate(['/task', {
      id: JSON.parse(localStorage.getItem('project')).id,
      componentId: this.LeftMenu.titleId,
      bridgeId: null,
    }]);
  }
  add() {
    this.formGroup.enable();
    this._appService.editState = true;
    this.LeftMenu.bridgeId = null;
    this.groupTaskElem.holeGroupId = null;
    this.LeftMenu.operationState = true;
    this.selectHoleGroup = null;
    if (this.copyState) {
      this.formGroup.controls['bridgeName'].setValue('');
      console.log('复制', this.nowData, this.holeGroups);
    } else {
      console.log('添加');
      this.newForm();
      this.nowData = null;
      this.nowComponent = null;
      this.nowDevice = null;
      this.holeGroups = null;
    }
  }
  onModify() {
    // this.formGroup.enable();
    this.formGroup.controls['bridgeName'].enable();
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
    console.log('保存');
    // tslint:disable-next-line:forin
    for (const key in this.formGroup.controls) {
      this.formGroup.controls[key].markAsDirty();
      this.formGroup.controls[key].updateValueAndValidity();
    }
    if (this.formGroup.valid) {
      let http = 'post';
      let message = { success: '任务添加', error: '任务名称' };
      let url = baseUri;
      console.log(this.formGroup.value, this.groupTaskElem.nowTaskDataArr);
      const fd = new FormData;
      // 复制梁
      if (this.copyState) {
        console.log('4456456456456456456456456456');
        url = '/task/copy';
        fd.append('id', this.nowData.id);
        fd.append('bridgeName', this.formGroup.controls['bridgeName'].value);
        fd.append('componentId', this.nowData.componentId);
        message = { success: '复制任务', error: '任务名称' };
      } else {
        // 修改梁
        if (this.nowData && 'id' in this.nowData) {
          http = 'put';
          message = { success: '任务修改', error: '任务名称' };
          url = `${baseUri}/${this.nowData.id}`;
          // 新建梁
        } else {
          this.groupTaskElem.nowTaskDataArr.forEach((item, index) => {
            // tslint:disable-next-line:forin
            for (const key in item) {
              fd.append(`holeGroups[${index}].${key}`, item[key]);
            }
          });
          fd.append('projectId', JSON.parse(localStorage.getItem('project')).id);
          fd.append('deviceId', this.nowDevice.device.id);
          fd.append('componentId', this.nowComponent.componentId);
        }
        // tslint:disable-next-line:forin
        for (const key in this.formGroup.value) {
          fd.append(key, this.formGroup.value[key]);
        }
      }
      this._servers.http(http, fd, url, message).subscribe(r => {
        if (r.state) {
          console.log(r);
          this._appService.editState = false;
          if (r.data.message) {
            this.formGroup.disable();
            this.LeftMenu.operationState = false;
            this.copyState = false;
            // this.LeftMenu.bridgeId = r.data.data.id;
            // this.LeftMenu.getBridges(r.data.data.componentId);
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
  }
  onCancel() {
    console.log('取消');
    if (this.nowData && 'id' in this.nowData) {
      setFromValue(this.nowData, this.formGroup);
    } else {
      this.newForm();
    }
    this.formGroup.disable();
    this.LeftMenu.operationState = false;
    this.copyState = false;
    this._appService.editState = false;
    this._router.navigate(['/task', {
      id: JSON.parse(localStorage.getItem('project')).id,
      componentId: this.LeftMenu.titleId,
    }]);
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
    console.log(data);
    this.nowComponent = data;
    if (data) {
      this.formGroup.controls['componentName'].setValue(data.componentName);
      this.formGroup.controls['holeName'].setValue(data.hole.sName);
    }
    this.selectComponentElem.isVisible = false;
    this.grouping();
  }
  onSelectDevice() {
    this.selectDeviceElem.isVisible = true;
  }
  outSelectDevice(data) {
    if (data) {
      console.log(data);
      this.nowDevice = data;
      this.formGroup.controls['deviceName'].setValue(data.device.sName);
      this.grouping();
    }
    this.selectDeviceElem.isVisible = false;
  }
  grouping() {
    if (this.nowComponent && this.nowDevice) {
      const holes = this.nowComponent.hole.holes;
      const deviceMode = this.nowDevice.selectDeviceMode;
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
      console.log(holeGroups);
      this.holeGroups = holeGroups;
      this.groupTaskElem.constructHoleFormGroup(holeGroups);
    }
  }
  onManual() {
    this.manualElem.isVisible = true;
  }
  outManual(data) {
    this.manualElem.isVisible = false;
    console.log(data);
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
      console.log(data);
      this.formGroup.controls['steelStrandName'].setValue(data.sName);
      this.steelStrandElem.isVisible = false;
    } else {
      this.steelStrandElem.isVisible = false;
    }
  }
  // 选择张拉孔组孔
  onSelectHoleRadio() {
    console.log('8888', this.selectHoleGroup);
    if (this.nowData) {
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
    this.onAdd();
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
        const tensionData = this.groupTaskElem.nowData;
        localStorage.setItem('nowDevice', this.nowDevice.device.id);
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
          bridgeName: this.nowData.bridgeName,
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
        const recordData: RecordData = {
          id: this.groupTaskElem.holeGroupId,
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
          },
          returnStart: {},
          liveMpaCvs: [],
          liveMmCvs: [],
        };
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
            recordData.returnStart[name] = { mpa: 0, mm: 0};
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
    return {stage: stage, recordData: rData, TwiceStage: TwiceStage};
  }
  runTensionOk() {
    this.onTension();
  }
}
