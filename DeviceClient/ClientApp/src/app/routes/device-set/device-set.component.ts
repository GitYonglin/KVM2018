import { Component, OnInit, OnDestroy } from '@angular/core';
import { DeviceParameter } from '../../model/DeviceParameter';
import { MSService } from '../../services/MS.service';
import { Value2PLC, Value2PLC100ms } from '../../utils/PLC8Show';

@Component({
  selector: 'app-device-set',
  templateUrl: './device-set.component.html',
  styleUrls: ['./device-set.component.less']
})
export class DeviceSetComponent implements OnInit, OnDestroy {
  data: DeviceParameter = null;

  constructor(
    public _ms: MSService,
  ) { }

  ngOnInit() {
    this._ms.connection.invoke('GetDeviceParameter');
    console.log('12313', this.data);
  }
  ngOnDestroy(): void {
    this._ms.connection.invoke('GetDeviceParameter');
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
