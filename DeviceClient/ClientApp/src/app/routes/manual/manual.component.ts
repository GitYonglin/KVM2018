import { Component, OnInit, OnDestroy, AfterViewInit, Input, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { APIService } from '../../services/api.service';
import { DeviceParameter } from '../../model/DeviceParameter';
import { MSService } from '../../services/MS.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { DeviceItemComponent } from './device-item/device-item.component';
import { N2F } from '../../utils/toFixed';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-manual',
  templateUrl: './manual.component.html',
  styleUrls: ['./manual.component.less']
})
export class ManualComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren(DeviceItemComponent)
  private deviceItems: QueryList<DeviceItemComponent>;
  deviceItem: DeviceItemComponent;
  devices = [];
  a1 = {
    state: true,
    setMpa: 0,
    setMm: 0,
    nowMpa: 5,
    nowMm: 10,
  };
  a2 = {
    state: true,
    setMpa: 0,
    setMm: 0,
    nowMpa: 5,
    nowMm: 10,
  };
  b1 = {
    state: true,
    setMpa: 0,
    setMm: 0,
    nowMpa: 5,
    nowMm: 10,
  };
  b2 = {
    state: true,
    setMpa: 0,
    setMm: 0,
    nowMpa: 5,
    nowMm: 10,
  };
  btn = {
    a1: true,
    a2: true,
    b1: true,
    b2: true,
  };
  nowValue = 0;
  realityValue = 0;
  correctionValue = 0;
  enforcement = false;
  autoState = false;
  correctionState = false;
  deviceName = '';
  correctionName = '';
  nowSetItem = null;
  nowKey = null;
  selectDeviceId = null;
  // deviceParameter: DeviceParameter;
  correctionIndex: any;
  resetMm: 0;

  @Input()
  deviceData: any;
  @Output()
  saveCorrectionValue = new EventEmitter<any>();

  constructor(
    private _service: APIService,
    public _ms: MSService,
    private _router: ActivatedRoute,
    private message: NzMessageService,
  ) {
    try {
      this._ms.connection.invoke('DF03Async', { address: 10, F03: 4 }).then((r) => {
        console.log('获取手动设置数据', r);
        const dev = this._ms.Dev;
        if (r.z) {
          this.a1.setMpa = dev.a1.PLC2Mpa(r.z[0]);
          this.a1.setMm = dev.a1.PLC2Mm(r.z[1]);
          if (dev.b1) {
            this.b1.setMpa = dev.b1.PLC2Mpa(r.z[2]);
            this.b1.setMm = dev.b1.PLC2Mm(r.z[3]);
          }
        }
        if (r.c) {
          console.log('从站', r.c);
          if (dev.a2) {
            this.a2.setMpa = dev.a2.PLC2Mpa(r.c[0]);
            this.a2.setMm = dev.a2.PLC2Mm(r.c[1]);
          }
          if (dev.b2) {
            this.b2.setMpa = dev.b2.PLC2Mpa(r.c[2]);
            this.b2.setMm = dev.b2.PLC2Mm(r.c[3]);
          }
        }
      });
    } catch (error) {
      console.log('设备没有连接！', error);
    }
  }

  ngOnInit() {
    // this.deviceParameter = JSON.parse(localStorage.getItem('DeviceParameter'));
    console.log('123232333333', this._ms.deviceParameter);
    this._ms.DF05(11, false);
    this._ms.DF05(10, true);
    // this._ms.connection.invoke('F03', {id: 1, address: 10, F03: 4});
    // this._ms.connection.invoke('F03', {id: 2, address: 10, F03: 4});
    // this._ms.connection.on('F03Return', (r) => {
    //   console.log('获取手动设置数据F03', r);
    //   const dev = this._ms.Dev;
    //   if (r.name === '主站') {
    //     this.a1.setMpa = dev.a1.PLC2Mpa(r.data[0]);
    //     this.a1.setMm = dev.a1.PLC2Mm(r.data[1]);
    //     if (dev.b1) {
    //       this.b1.setMpa = dev.b1.PLC2Mpa(r.data[2]);
    //       this.b1.setMm = dev.b1.PLC2Mm(r.data[3]);
    //     }
    //   }
    //   if (r.name === '从站') {
    //     if (dev.a2) {
    //       this.a2.setMpa = dev.a2.PLC2Mpa(r.data[0]);
    //       this.a2.setMm = dev.a2.PLC2Mm(r.data[1]);
    //     }
    //     if (dev.b2) {
    //       this.b2.setMpa = dev.b2.PLC2Mpa(r.data[2]);
    //       this.b2.setMm = dev.b2.PLC2Mm(r.data[3]);
    //     }
    //   }
    // });

    this._service.get('/device').subscribe(p => {
      console.log('000000000', p);
      if (p) {
        this.devices = p;
        this.selectDeviceId = localStorage.getItem('nowDevice');
        this.onSwitchDevice();
      } else {
        this.devices = [];
      }
    });
  }
  ngOnDestroy(): void {
    console.log('手动结束');
    this._ms.DF05(11, false);
    this._ms.DF05(10, false);
  }
  ngAfterViewInit() {
  }
  onState(name) {
    this[name].state = !this[name].state;
    this.btn[name] = this[name].state;
  }
  onEnforcement() {
    this.enforcement = !this.enforcement;
    this._ms.DF05(11, this.enforcement);
  }
  onAutoState() {
    this.autoState = !this.autoState;
  }
  // 进入校正
  public onCorrection(state, deviceName, name) {
    this.correctionState = state;
    this.deviceName = deviceName;
    this.correctionName = name;
    this.nowSetItem = null;
    this.nowKey = null;
    this.a1.state = false;
    this.a2.state = false;
    this.b1.state = false;
    this.b2.state = false;
    this.deviceItem = this.deviceItems.filter(d => d.name === name)[0];
    this.deviceItem.data.state = true;
  }
  // 校正项选择
  public onSetCorrection(name: string, key: string, i) {
    this.nowSetItem = name;
    this.nowKey = key;
    const reg = /\[(.+?)\]/;
    this.correctionIndex = key.match(reg)[1];
    if (name.indexOf('Mpa') !== -1) {
      this.deviceItem.data.setMpa = Number(name.slice(0, name.length - 3));
      this.deviceItem.data.setMm = 0;
    } else {
      this.deviceItem.data.setMm = Number(name.slice(0, name.length - 2));
      this.deviceItem.data.setMpa = 3;
    }
    this.deviceItem.onSetMm();
    this.deviceItem.onSetMpa();
  }
  // 保存校正值
  onSaveCorrectionValue() {
    if (this.nowSetItem.indexOf('Mpa') !== -1) {
      this.deviceData[this.correctionName].correction.mpa[this.correctionIndex] = this.correctionValue;
    } else {
      this.deviceData[this.correctionName].correction.mm[this.correctionIndex] = this.correctionValue;
    }
    this.saveCorrectionValue.emit({ key: this.nowKey, value: this.correctionValue });
    this._ms.nowDevice = this.deviceData;
  }
  // 计算校准值
  calculate() {
    this.correctionValue = Number((this.realityValue / this.nowValue).toFixed(4));
  }
  // 校正获取设备值
  getNowValue() {
    const name = this.nowSetItem;
    if (name.indexOf('Mpa') !== -1) {
      this.nowValue = this._ms.showValues[this.correctionName].mpa;
    } else {
      this.nowValue = N2F(this._ms.showValues[this.correctionName].mm - this.resetMm);
    }
    this.calculate();
    console.log(name, this.deviceItem.data);
  }
  // 切换泵顶组
  onSwitchDevice() {
    this._ms.setDevice(this.selectDeviceId, (r) => {
      if (r) {
        this.message.create('success', `设备切换成功！`);
      } else {
        this.message.create('error', `设备切换错误！`);
      }
    });
    // this._service.get(`/device/${this.selectDeviceId}`).subscribe(r => {
    //   this.deviceData = r;
    //   this._ms.nowDevice = this.deviceData;
    // });
    // console.log(this.deviceData);
  }
}
