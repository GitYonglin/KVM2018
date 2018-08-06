import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { APIService } from '../../../services/api.service';

@Component({
  selector: 'app-select-component',
  templateUrl: './select-component.component.html',
  styleUrls: ['./select-component.component.less']
})
export class SelectComponentComponent implements OnInit {
  isVisible = false;
  components: any;
  componentId: any;
  componentName: any;
  holeData: any;
  selectHoleData: any;
  holes: any;
  selectItem: any;
  selectHoleItem: any;

  @Output()
  outClose = new EventEmitter<any>();
  @Input()
    nowComponentId = null;

  constructor(
    private message: NzMessageService,
    private _service: APIService
  ) { }

  ngOnInit() {
    this.getComponent();
  }
  getComponent() {
    this._service.get('/component').subscribe(p => {
      console.log('101010101010', p);
      if (p) {
        this.components = p;
      } else {
        this.components = null;
      }
    });
  }

  handleCancel(): void {
    this.outClose.emit();
  }

  handleOk() {
    console.log(this.selectHoleData);
    if (this.holes) {
      this.outClose.emit(
        {
          componentName: this.componentName,
          componentId: this.componentId,
          hole: this.selectHoleData
        });
    } else {
      this.message.create('error', '请完成构件孔号选择！');
    }
  }

  onSelect() {
    const data = this.selectItem;
    if (data) {
      this._service.get(`/component/${data.id}`).subscribe(r => {
        this.holeData = r.holes;
        console.log(r.holes);
      });
      this.componentName = data.name;
      this.componentId = data.id;
      this.selectHoleData = null;
      this.holes = null;
    }
  }
  onHoles() {
    const data = this.selectHoleItem;
    this.holes = data.holes;
    this.selectHoleData = data;
  }
}
