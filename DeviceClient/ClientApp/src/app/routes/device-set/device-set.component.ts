import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DeviceParameter } from '../../model/DeviceParameter';
import { MSService } from '../../services/MS.service';
import { Value2PLC, Value2PLC100ms } from '../../utils/PLC8Show';
import { ManualComponent } from '../manual/manual.component';
import { baseForm } from './form.data';
import { FormGroup } from '@angular/forms';
import { AppService } from '../app.service';
import { NzMessageService } from 'ng-zorro-antd';

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

  constructor(
    public _ms: MSService,
    public _appService: AppService,
    private message: NzMessageService
  ) { }

  ngOnInit() {
    try {
      this._ms.connection.invoke('GetDeviceParameter');
    } catch (error) {
      console.error('ms未初始化');
    }
    // this._ms.GetDeviceParameterEvent = function () { document.dispatchEvent(new Event('GetDeviceParameter')); };
    document.addEventListener('GetDeviceParameter', () => {
      console.log('事件GetDeviceParameter', this._ms.deviceParameter);
      this.baseForm = baseForm(this._ms.deviceParameter);
      if (this._ms.deviceParameterC) {
        this.baseFormC = baseForm(this._ms.deviceParameterC);
        this.baseFormC.formGroup.disable();
      }
      this.baseForm.formGroup.valueChanges.subscribe((e) => {
        console.log(e);
        this._appService.editState = true;
      });
    });
    console.log('12313', this.data);
  }
  ngOnDestroy(): void {
    try {
      this._ms.connection.invoke('GetDeviceParameter');
    } catch (error) {
      console.error('ms未初始化');
    }
  }

  onSet(address: number, event, make?) {
    console.log(address, );
    let value = event.target.valueAsNumber;
    if (make === 'mpa') {
      value = Value2PLC(value, this._ms.deviceParameter.mpaCoefficient, 5);
    } else if (make === 'mm') {
      value = Value2PLC(value, this._ms.deviceParameter.mmCoefficient, 40);
    } else if (make === 's') {
      value = Value2PLC100ms(value);
    }
    this._ms.SetDeviceParameter(address, value, (r) => {
      console.log(r);
    });
  }
  cancel() {
    this._appService.editState = false;
    this._ms.connection.invoke('GetDeviceParameter');
  }
  baseSave() {
    const connectState = localStorage.getItem('connect');
    if ((connectState === '2' && (this._ms.Dev.a1 && this._ms.Dev.a1.liveData.connectState)
      && (this._ms.Dev.a2 && this._ms.Dev.a2.liveData.connectState))
      || ( connectState === '1' && (this._ms.Dev.a1 && this._ms.Dev.a1.liveData.connectState)) ) {
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
      this._ms.connection.invoke('SetDeviceParameter', { address: 500, values: values });
    } else {
      this.message.create('error', `设备连接错误`);
    }
  }
}
