import { Component, OnInit } from '@angular/core';
import { DeviceParameter } from '../../model/DeviceParameter';
import { MSService } from '../../services/MS.service';
import { Value2PLC, Value2PLC100ms } from '../../utils/PLC8Show';

@Component({
  selector: 'app-device-set',
  templateUrl: './device-set.component.html',
  styleUrls: ['./device-set.component.less']
})
export class DeviceSetComponent implements OnInit {
  data: DeviceParameter = null;

  constructor(
    public _ms: MSService,
  ) { }

  ngOnInit() {
    // this.data = JSON.parse(localStorage.getItem('DeviceParameter'));
    this._ms.connection.invoke('GetDeviceParameter');
    console.log('12313', this.data);
    // this._ms.connection.on('DeviceParameter', rData => {
    //   if (rData.name === '主站') {
    //     console.log('1主站', rData.data);
    //     this._ms.setDeviceParameterValue(rData.data);
    //     this.data = JSON.parse(localStorage.getItem('DeviceParameter'));
    //   } else {
    //   }
    // });
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
}
