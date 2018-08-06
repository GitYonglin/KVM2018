import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-form-up-img',
  templateUrl: './form-up-img.component.html',
  styleUrls: ['./form-up-img.component.less']
})
export class FormUpImgComponent implements OnInit {
  @Input()
    imgUrl = '';
  @Input()
    title = '图片';

  @Output()
    upFile = new EventEmitter<any>();

  constructor(public _d: DomSanitizer) { }

  ngOnInit() {
  }

  upFileChange(e) {
    const file = e.srcElement.files[0];
    // this.imgUrl = window.URL.createObjectURL(file);
    this.upFile.emit(file);
  }
}
