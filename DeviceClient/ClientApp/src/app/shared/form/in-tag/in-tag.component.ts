import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-in-tag',
  templateUrl: './in-tag.component.html',
  styleUrls: ['./in-tag.component.less']
})
export class InTagComponent implements OnInit {
  @ViewChild('inputElement') inputElement: ElementRef;
  addBtn = '添加';
  inputVisible = false;
  inputValue = '';
  @Input()
  tags = [];
  @Output()
  outValue = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  handleClose(removedTag: {}): void {
    this.tags = this.tags.filter(tag => tag !== removedTag);
    this.outValue.emit(this.tags);
  }

  sliceTagName(tag: string): string {
    const isLongTag = tag.length > 20;
    return isLongTag ? `${tag.slice(0, 20)}...` : tag;
  }

  showInput(): void {
    this.inputVisible = true;
    setTimeout(() => {
      this.inputElement.nativeElement.focus();
    }, 10);
  }

  handleInputConfirm(): void {
    console.log(this.tags);
    const value = this.inputElement.nativeElement.value;
    if (value && this.tags.indexOf(value) === -1) {
      this.tags.push(value);
    }
    this.inputValue = '';
    this.inputVisible = false;
    this.outValue.emit(this.tags);
  }
}
