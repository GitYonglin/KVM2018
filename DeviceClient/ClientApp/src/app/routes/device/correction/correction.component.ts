import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { componentData } from '../../../model/component.model';
import { ManualComponent } from '../../manual/manual.component';
import { AppService } from '../../app.service';

@Component({
  selector: 'app-correction',
  templateUrl: './correction.component.html',
  styleUrls: ['./correction.component.less']
})
export class CorrectionComponent implements OnInit {
  @ViewChild(ManualComponent)
    private manual: ManualComponent;
  imgFile: File;
  isVisible = false;
  workMode = ['a1', 'a2', 'b1', 'b2'];
  correctionName = null;

  @Input()
  labelSpan = 4;
  @Input()
  controlSpan = 19;
  @Input()
  formGroup: FormGroup;
  @Input()
  formTypes: any;
  @Input()
  formClass = '';

  constructor(
    public _appService: AppService,
  ) { }

  ngOnInit() {}
  onCorrection(name) {
    console.log(this.formGroup.value);
    if (this.correctionName !== null) {
      this.manual.onCorrection(false, this.formGroup.controls['sName'].value, name);
      this.correctionName = null;
    } else {
      this.manual.onCorrection(true, this.formGroup.controls['sName'].value, name);
      this.correctionName = name;
    }
  }
  onSetCorrection(name, key, i) {
    console.log(name, key);
    this.manual.onSetCorrection(name, key, i);
  }
  saveCorrectionValue(data) {
    console.log(data.key, data.value);
    this.formGroup.controls[data.key].setValue(data.value);
  }
}
