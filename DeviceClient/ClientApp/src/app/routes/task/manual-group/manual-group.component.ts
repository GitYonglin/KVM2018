import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-manual-group',
  templateUrl: './manual-group.component.html',
  styleUrls: ['./manual-group.component.less'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManualGroupComponent implements OnInit {
  mode: any;
  aHole = null;
  bHole = null;
  group = [];
  groupMode = [];
  selectHole = [];
  @Input()
  isVisible = false;
  @Input()
  device: any;
  @Input()
  holes: any;
  @Input()
  show = false;

  @Output()
  outClose = new EventEmitter<any>();

  constructor(private message: NzMessageService) { }

  ngOnInit() {
    this.selectHole = this.holes;
    this.mode = this.device.selectDeviceMode;
  }
  handleCancel(): void {
    this.outClose.emit();
  }

  handleOk() {
    if (this.selectHole.length === 0) {
      this.outClose.emit(this.groupMode);
      this.group = [];
      this.groupMode = [];
      this.selectHole = [];
      this.onHoleChange();
    } else {
      this.message.create('error', '必须完成所有分组');
    }
  }

  onDevice() {
    this.aHole = null;
    this.bHole = null;
    this.onHoleChange();
  }

  onHoleChange(e = null) {
    const b = [...this.group, this.aHole, this.bHole];
    this.selectHole = this.holes.concat(b).filter(v => !this.holes.includes(v) || !b.includes(v)).filter(f => f !== null);
    console.log(this.selectHole, this.groupMode);
  }
  save() {
    if ((this.mode === 4 && this.aHole && this.bHole) || (this.mode !== 4 && (this.aHole || this.bHole))) {
      this.group.push(this.aHole, this.bHole);
      let hole = `${this.aHole}/${this.bHole}`;
      if (this.mode !== 4 && this.aHole) {
        hole = this.aHole;
      } else if (this.mode !== 4 && this.bHole) {
        hole = this.bHole;
      }
      this.groupMode.push({mode: this.mode, hole: hole});
      this.aHole = null;
      this.bHole = null;
      this.onHoleChange();
    } else {
      this.message.create('error', '请完成构件孔号选择！');
    }
  }
}
