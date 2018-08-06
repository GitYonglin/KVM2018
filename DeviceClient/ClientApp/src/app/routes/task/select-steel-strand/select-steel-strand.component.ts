import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { APIService } from '../../../services/api.service';

@Component({
  selector: 'app-select-steel-strand',
  templateUrl: './select-steel-strand.component.html',
  styleUrls: ['./select-steel-strand.component.less']
})
export class SelectSteelStrandComponent implements OnInit {
  isVisible = false;
  steelStrandData: any;
  selectSteelStrand: any;

  @Output()
  outClose = new EventEmitter<any>();

  constructor(
    private message: NzMessageService,
    private _service: APIService
  ) { }

  ngOnInit() {
    const project = JSON.parse(localStorage.getItem('project'));
    console.log(project);
    this._service.get(`/project/${project.id}`).subscribe(r => {
      console.log(r);
      this.steelStrandData = r.steelStrands;
    });
  }

  handleCancel(): void {
    this.outClose.emit();
  }

  handleOk() {
    console.log(this.selectSteelStrand);
    if (this.selectSteelStrand) {
      this.outClose.emit(this.selectSteelStrand);
    } else {
      this.message.create('error', '请完成钢绞线选择！');
    }
  }

  onSelect(data) {
    this.selectSteelStrand = data;
  }
}
