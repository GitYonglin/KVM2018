import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DeviceParameter } from '../../model/DeviceParameter';
import { MSService } from '../../services/MS.service';
import { Value2PLC, Value2PLC100ms } from '../../utils/PLC8Show';
import { ManualComponent } from '../manual/manual.component';
import { baseForm } from './form.data';
import { FormGroup } from '@angular/forms';
import { AppService } from '../app.service';
import { NzMessageService } from 'ng-zorro-antd';
import { setFromValue } from '../../utils/form/construct-form';
import { AutoControlModel } from '../../utils/autoTension';

@Component({
  selector: 'app-device-set',
  templateUrl: './device-set.component.html',
  styleUrls: ['./device-set.component.less']
})
export class DeviceSetComponent implements OnInit, OnDestroy {
  @ViewChild(ManualComponent)
  private manual: ManualComponent;
  data: DeviceParameter = null;
  correctionName = null;
  workMode = ['a1', 'a2', 'b1', 'b2'];
  modeState = false;
  index = 0;
  baseForm: { formTypes: any, formGroup: FormGroup } = null;
  baseFormC: { formTypes: any, formGroup: FormGroup } = null;
  saveState = false;
  autoControlModel: AutoControlModel;

  constructor(
    public _ms: MSService,
    public _appService: AppService,
    private message: NzMessageService
  ) { }

  ngOnInit() {
    if (this._ms.deviceParameter) {
      this.baseForm = baseForm(this._ms.deviceParameter);
    } else {
      this.baseForm = baseForm(null);
      this.baseForm.formGroup.disable();
    }
    if (this._ms.deviceParameterC) {
      this.baseFormC = baseForm(this._ms.deviceParameterC);
      this.baseFormC.formGroup.disable();
    } else if (localStorage.getItem('connect') === '2') {
      this.baseFormC = baseForm(null);
      this.baseFormC.formGroup.disable();
    }
    /** 监听修改设备参数 */
    this.baseForm.formGroup.valueChanges.subscribe((e) => {
      console.log(e);
      this._appService.editState = true;
    });
    /** 监听获取设备参数 */
    document.addEventListener('GetDeviceParameter', () => {
      console.log('事件GetDeviceParameter', this._ms.deviceParameter);
      // this.baseForm = baseForm(this._ms.deviceParameter);
      if (this._ms.deviceParameter) {
        setFromValue(this._ms.deviceParameter, this.baseForm.formGroup);
        this.baseForm.formGroup.enable();
      }
      if (this._ms.deviceParameterC) {
        setFromValue(this._ms.deviceParameterC, this.baseFormC.formGroup);
        this.baseFormC.formGroup.disable();
      }
      this._appService.editState = false;
      this.saveState = false;
    });
    console.log('12313', this.data);
    /** 获取自动控制参数 */
    this.autoControlModel = JSON.parse(localStorage.getItem('AutoControl'));
  }
  ngOnDestroy(): void {
  }

  /** 取消修改 */
  cancel() {
    this._appService.editState = false;
    // this._ms.connection.invoke('GetDeviceParameter');
    setFromValue(this._ms.deviceParameter, this.baseForm.formGroup);
    if (this._ms.deviceParameterC) {
      setFromValue(this._ms.deviceParameterC, this.baseFormC.formGroup);
    }
  }
  /** 保存数据到PLC */
  baseSave() {
    const connectState = localStorage.getItem('connect');
    if ((connectState === '2' && (this._ms.Dev.a1 && this._ms.Dev.a1.liveData.connectState)
      && (this._ms.Dev.a2 && this._ms.Dev.a2.liveData.connectState))
      || (connectState === '1' && (this._ms.Dev.a1 && this._ms.Dev.a1.liveData.connectState))) {
      this.saveState = true;
      const data = this.baseForm.formGroup.value;
      const values = [];
      values.push(Value2PLC(data.mpaUpperLimit, this._ms.deviceParameter.mpaCoefficient));
      values.push(Value2PLC(data.returnMpa, this._ms.deviceParameter.mpaCoefficient));
      values.push(Value2PLC(data.settingMpa, this._ms.deviceParameter.mpaCoefficient));
      values.push(data.oilPumpDelay * 10);
      values.push(Value2PLC(data.mmUpperLimit, this._ms.deviceParameter.mmCoefficient));
      values.push(Value2PLC(data.mmLowerLimit, this._ms.deviceParameter.mmCoefficient));
      values.push(Value2PLC(data.mmWorkUpperLimit, this._ms.deviceParameter.mmCoefficient));
      values.push(Value2PLC(data.mmWorkLowerLimit, this._ms.deviceParameter.mmCoefficient));
      values.push(Number(data.modeRadio));
      console.log(data, values);
      this._appService.editState = false;
      this._ms.connection.invoke('SetDeviceParameterAsync', { address: 500, F16: values });
    } else {
      this.message.create('error', `设备连接错误`);
    }
  }

  editAutoContro(e, name) {
    this._appService.editState = true;
    this.autoControlModel[name] = e.target.valueAsNumber;
    console.log(e.target.valueAsNumber);
  }
  autoControSave() {
    localStorage.setItem('AutoControl', JSON.stringify(this.autoControlModel));
    this._appService.editState = false;
  }
  autoControcancel() {
    this.autoControlModel = JSON.parse(localStorage.getItem('AutoControl'));
    this._appService.editState = false;
  }
}
