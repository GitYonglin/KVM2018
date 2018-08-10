import { Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HubConnectionBuilder, HubConnection } from '@aspnet/signalr';
import { MSService } from '../../services/MS.service';
import { setCvs } from '../../utils/cvsData';
import { Value2PLC } from '../../utils/PLC8Show';

@Component({
  selector: 'app-tension',
  templateUrl: './tension.component.html',
  styleUrls: ['./tension.component.less']
})
export class TensionComponent implements OnInit, AfterViewInit {
  @ViewChild('cvs') elementCvs: ElementRef;
  heightCvs: any;
  widthCvs: any;
  msg = 500;
  messages = '';
  connection: HubConnection;

  runTension = {
    runState: true,
  };
  autoControl = {
    maximumDeviationRate: 0,
    LowerDeviationRate: 0,
    mpaDeviation: 0,
    mmBalanceControl: 0,
    mmReturnLowerLimit: 0,
    unloadingDelay: 0,
  };

  constructor(
    public _ms: MSService
  ) { }

  ngOnInit() {
    // this.tensionData = JSON.parse(localStorage.getItem('nowTensionData'));
    // this._ms.tensionData = this.tensionData;
    // console.log(this.tensionData);
    console.log('预备', this._ms.tensionData, this._ms.runTensionData, this._ms.recordData);
    this._ms.upPLC();
    this.autoControl.maximumDeviationRate = this._ms.deviceParameter.maximumDeviationRate;
    this.autoControl.LowerDeviationRate = this._ms.deviceParameter.LowerDeviationRate;
    this.autoControl.mpaDeviation = this._ms.deviceParameter.mpaDeviation;
    this.autoControl.mmBalanceControl = this._ms.deviceParameter.mmBalanceControl;
    this.autoControl.mmReturnLowerLimit = this._ms.deviceParameter.mmReturnLowerLimit;
    this.autoControl.unloadingDelay = this._ms.deviceParameter.unloadingDelay;
  }
  ngAfterViewInit() {
    this.heightCvs = this.elementCvs.nativeElement.offsetHeight - 5;
    this.widthCvs = this.elementCvs.nativeElement.offsetWidth - 5;
    console.log(this.heightCvs, this.widthCvs);
  }
  // getMpaCvs() {
  //   console.log(setCvs(this._ms.recordData.cvsData, this._ms.recordData.mode, 'mpa'));
  //   return setCvs(this._ms.recordData.cvsData, this._ms.recordData.mode, 'mpa');
  // }
  // getMmCvs() {
  //   console.log(setCvs(this._ms.recordData.cvsData, this._ms.recordData.mode, 'mm'));
  //   return setCvs(this._ms.recordData.cvsData, this._ms.recordData.mode, 'mm');
  // }

  onCancelTension() {
    console.log('取消张拉');
    this.runTension.runState = false;
  }
  onRunTension() {
    console.log('启动张拉');
    this._ms.saveCvs();
    this._ms.connection.invoke('AutoF05', { mode: this._ms.tensionData.mode, address: 520, F05: true});
    this.runTension.runState = false;
    this._ms.runTensionData.state = true;
    // this._ms.DelaySaveCvs();
  }
  onSet(address: number, event, make?) {
    console.log(address, );
    let value = event.target.valueAsNumber;
    if (make === 'mpa') {
      value = Value2PLC(value, this._ms.deviceParameter.mpaCoefficient, 5);
    } else if (make === 'mm') {
      value = Value2PLC(value, this._ms.deviceParameter.mmCoefficient, 40);
    }
    this._ms.SetDeviceParameter(address, value, (r) => {
      console.log(r);
    });
  }
  // setRecordData() {
  //   const mpa = null;
  //   this.tensionData.modes.forEach(name => {
  //     this.tensionData.checkData.forEach(index => {
  //       mpa[name] =
  //     });
  //   });
  //   this._ms.recordData = {
  //     stage: 0,
  //     time: number[],
  //     mpa: {
  //       a1?: number[],
  //       a2?: number[],
  //       b1?: number[],
  //       b2?: number[],
  //     },
  //     mm: {
  //       a1?: number[],
  //       a2?: number[],
  //       b1?: number[],
  //       b2?: number[],
  //     }
  //   };
  // }

  F05(id, address, data) {
    this._ms.connection.invoke('F05', { Id: id, Address: address, F05: data });
  }
  F01(id, address, data) {
    this._ms.connection.invoke('F01', { Id: id, Address: address, F01: data });
    // for (let index = 0; index < 100; index++) {
    // }
    console.log(id, data);
  }
  Test() {
    this._ms.connection.invoke('Test');
    // for (let index = 0; index < 100; index++) {
    // }
  }
}
