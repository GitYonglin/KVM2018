import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-work-mode',
  templateUrl: './work-mode.component.html',
  styleUrls: ['./work-mode.component.less']
})
export class WorkModeComponent implements OnInit {
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

  constructor() { }

  ngOnInit() {}
}
