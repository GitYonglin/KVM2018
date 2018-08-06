import { Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HubConnectionBuilder, HubConnection } from '@aspnet/signalr';
import { MSService } from '../../services/MS.service';
import { setCvs } from '../../utils/cvsData';

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
  tensionData: any;
  cvsData = {
    timeState: new Date().getTime(),
    timeEnd: new Date().getTime(),
    skep: 3,
    mode: 4,
    a1: [0],
    a2: [0],
    b1: [0],
    b2: [0],
  };

  constructor(
    public _ms: MSService
  ) { }

  ngOnInit() {
    this.tensionData = JSON.parse(localStorage.getItem('nowTensionData'));
    console.log(this.tensionData);
    this._ms.upPLC(this.tensionData, 0);
  }
  ngAfterViewInit() {
    this.heightCvs = this.elementCvs.nativeElement.offsetHeight - 5;
    this.widthCvs = this.elementCvs.nativeElement.offsetWidth - 5;
    console.log(this.heightCvs, this.widthCvs);
  }
  getCvs() {
    return setCvs(this.cvsData);
  }
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
