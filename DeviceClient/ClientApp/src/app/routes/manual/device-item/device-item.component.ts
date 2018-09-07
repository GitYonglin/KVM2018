import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MSService } from '../../../services/MS.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';



@Component({
  selector: 'app-device-item',
  templateUrl: './device-item.component.html',
  styleUrls: ['./device-item.component.less']
})
export class DeviceItemComponent implements OnInit {
  relativeMm = 0;
  address = 10;
  id = 1;

  @Input()
  name: string;
  @Input()
  title: string;
  @Input()
  data: any;
  @Input()
  disabled = false;

  @Output()
  resetZero = new EventEmitter<any>();

  public mmStream: Subject<{address: number, F06: number}> = new Subject<{address: number, F06: number}>();
  public mpaStream: Subject<{address: number, F06: number}> = new Subject<{address: number, F06: number}>();
  constructor(public _ms: MSService) { }

  ngOnInit() {
    this.id = (this.name === 'a1' || this.name === 'b1') ? 1 : 2;
    this.address = (this.name === 'a1' || this.name === 'a2') ? 10 : 12;
    console.log(this.id);

    this.mmStream
      .pipe(debounceTime(500))
      .pipe(distinctUntilChanged())
      .subscribe(data => {
        this._ms.connection.invoke('F06', { id: this.id, address: data.address, F06: data.F06 });
        console.log(data);
      });
    this.mpaStream
      .pipe(debounceTime(500))
      .pipe(distinctUntilChanged())
      .subscribe(data => {
        this._ms.connection.invoke('F06', { id: this.id, address: data.address, F06: data.F06 });
        console.log(data);
      });
  }

  onSetMpa() {
    const F06 = this._ms.Dev[this.name].Mpa2PLC(this.data.setMpa);
    this.mpaStream.next({address: this.address, F06: F06});
  }
  onSetMm(): void {
    const F06 = this._ms.Dev[this.name].Mm2PLC(this.data.setMm);
    // this._ms.connection.invoke('F06', { id: this.id, address: this.address, F06: F06 });
    this.mmStream.next({address: this.address + 1, F06: F06});
  }
  reset() {
    this.relativeMm = this._ms.showValues[this.name].mm;
    this.resetZero.emit(this.relativeMm);
    console.log(this._ms.showValues[this.name].mm, this.relativeMm);
  }
}
