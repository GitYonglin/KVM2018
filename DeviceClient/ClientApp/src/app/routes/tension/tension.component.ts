import { Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { HubConnectionBuilder, HubConnection } from '@aspnet/signalr';
import { MSService } from '../../services/MS.service';
import { setCvs } from '../../utils/cvsData';
import { Value2PLC } from '../../utils/PLC8Show';

@Component({
  selector: 'app-tension',
  templateUrl: './tension.component.html',
  styleUrls: ['./tension.component.less']
})
export class TensionComponent implements OnInit, AfterViewInit, OnDestroy {
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
  stop = false;

  ngOnDestroy(): void {
    console.log('自动结束');
    if (this.stop) {
      this._ms.DF05(520, false);
      this._ms.DF05(10, false);
      this._ms.runTensionData = {
        state: false,
        stage: 0,
        delayState: false,
        stateOk: false,
        LodOffTime: 0,
        nowLodOffTime: 0,
        loadOffDelayState: false,
        returnState: false,
        returnTime: 5,
        mmBalanceControl: 0,
        stopState: false,
      };
    }
  }
  constructor(
    public _ms: MSService
  ) { }

  ngOnInit() {
    // this.tensionData = JSON.parse(localStorage.getItem('nowTensionData'));
    // this._ms.tensionData = this.tensionData;
    // console.log(this.tensionData);
    console.log('预备', this._ms.tensionData, this._ms.runTensionData, this._ms.recordData, this._ms.deviceParameter);
    this._ms.upPLC();
    this.autoControl.maximumDeviationRate = this._ms.deviceParameter.maximumDeviationRate;
    this.autoControl.LowerDeviationRate = this._ms.deviceParameter.LowerDeviationRate;
    this.autoControl.mpaDeviation = this._ms.deviceParameter.mpaDeviation;
    this.autoControl.mmReturnLowerLimit = this._ms.deviceParameter.mmReturnLowerLimit;
    this._ms.runTensionData.mmBalanceControl = this._ms.deviceParameter.mmBalanceControl;
    this._ms.runTensionData.LodOffTime = this._ms.deviceParameter.unloadingDelay;
  }
  ngAfterViewInit() {
    this.heightCvs = this.elementCvs.nativeElement.offsetHeight - 5;
    this.widthCvs = this.elementCvs.nativeElement.offsetWidth - 5;
    console.log(this.heightCvs, this.widthCvs);
  }
  onCancelTension() {
    console.log('取消张拉');
    this.runTension.runState = false;
  }
  onRunTension() {
    console.log('启动张拉', this._ms.tensionData.mode);
    // this._ms.saveCvs();
    this._ms.connection.invoke('AutoF05', { mode: this._ms.tensionData.mode, address: 520, F05: true});
    console.log('MS请求');
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
  onStop() {
    this.stop = true;
    history.go(-1);
  }
  onAutoReturn() {
    this._ms.runTensionData.returnState = false;
    // 返回上一页
    history.go(-1);
  }
  onStop2run() {
    this._ms.connection.invoke('Stop2Run');
    console.log('MS请求');
  }
  onSaveExit() {

  }
  F05(id, address, data) {
    this._ms.connection.invoke('F05', { Id: id, Address: address, F05: data });
    console.log('MS请求');
  }
  F01(id, address, data) {
    this._ms.connection.invoke('F01', { Id: id, Address: address, F01: data });
    console.log('MS请求');
    // for (let index = 0; index < 100; index++) {
    // }
    console.log(id, data);
  }
  Test() {
    this._ms.connection.invoke('Test');
    console.log('MS请求');
    // for (let index = 0; index < 100; index++) {
    // }
  }
}
