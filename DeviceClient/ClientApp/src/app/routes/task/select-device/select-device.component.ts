import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { APIService } from '../../../services/api.service';

@Component({
  selector: 'app-select-device',
  templateUrl: './select-device.component.html',
  styleUrls: ['./select-device.component.less']
})
export class SelectDeviceComponent implements OnInit {
  isVisible = false;
  device: any;
  deviceId: any;
  selectDevice: any;
  workMode: any;
  selectDeviceMode: any;

  @Output()
  outClose = new EventEmitter<any>();

  constructor(
    private message: NzMessageService,
    private _service: APIService
  ) { }

  ngOnInit() {
    this._service.get('/device').subscribe(p => {
      console.log('设备选择', p);
      if (p) {
        this.device = p;
      } else {
        this.device = null;
      }
    });
  }

  handleCancel(): void {
    this.outClose.emit();
  }

  handleOk() {
    console.log(this.selectDeviceMode);
    if (this.selectDeviceMode >= 0) {
      this.outClose.emit(
        {
          selectDeviceMode: this.selectDeviceMode,
          device: this.selectDevice
        });
    } else {
      this.message.create('error', '请完成构件孔号选择！');
    }
  }

  onSelect(data) {
    if (data.id !== this.deviceId) {
      this._service.get(`/device/${data.id}`).subscribe(r => {
        this.selectDevice = r;
        this.workMode = r.aWorkMode;
        console.log(r);
      });
      this.deviceId = data.id;
      this.workMode = [];
      this.selectDeviceMode = null;
    }
  }
  onMode(data) {
    this.selectDeviceMode = data;
  }
}
