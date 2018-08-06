import { Component, OnInit, Input } from '@angular/core';
import { Value2PLC } from '../../../utils/PLC8Show';
import { DeviceParameter, ShowValues } from '../../../model/DeviceParameter';
import { MSService } from '../../../services/MS.service';

@Component({
  selector: 'app-device-item',
  templateUrl: './device-item.component.html',
  styleUrls: ['./device-item.component.less']
})
export class DeviceItemComponent implements OnInit {
  @Input()
  name: string;
  @Input()
  data: any;
  @Input()
  disabled = false;

  constructor(public _ms: MSService) { }

  ngOnInit() {
  }

  onSet(make) {
    let value = this.data.setMpa;
    let id = 2;
    let address = 10;
    if (make === 'mm') {
      value = this.data.setMm;
    }
    value = this._ms.Value2PLC( value, make, this.name);
    console.log(value, make, this.name);
    if (this.name === 'a1' ||  this.name === 'b1') {
      id = 1;
    }
    switch (this.name) {
      case 'a1':
      case 'a2':
        address = 10;
        if (make === 'mm') {
          address = 11;
        }
        break;
      case 'b1':
      case 'b2':
        address = 12;
        if (make === 'mm') {
          address = 13;
        }
        break;
      default:
        break;
    }
    this._ms.F06(id, address, value);
    console.log(id, address, value);
  }
}
