import { NgModule } from '@angular/core';
import { FullMenuComponent } from './full-menu/full-menu.component';
import { CanvasCvsComponent } from './canvas-cvs/canvas-cvs.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LeftMenuComponent } from './left-menu/left-menu.component';
import { CommonModule } from '@angular/common';
import { FormErrorPipe, ImgUrlPipe, DeviceMode, Number2Float, Lower2Upper, CheckboxSelect, StringSort } from '../pipe/form-error.pipe';
import { FormUpImgComponent } from './form/form-up-img/form-up-img.component';
import { ModalFormDataComponent } from './form/modal-form-data/modal-form-data.component';
import { ChildrenFormComponent } from './form/children-form/children-form.component';
import { InTagComponent } from './form/in-tag/in-tag.component';
import { ManualComponent } from '../routes/manual/manual.component';
import { DeviceItemComponent } from '../routes/manual/device-item/device-item.component';
import { MenuButtonComponent } from './menu-button/menu-button.component';

const imports = [
  CommonModule,
  NgZorroAntdModule,
  FormsModule,
  ReactiveFormsModule,
];
const declarations = [
  CanvasCvsComponent,
  DeviceItemComponent,
  ManualComponent,
  FullMenuComponent,
  LeftMenuComponent,
  MenuButtonComponent,
  FormUpImgComponent,
  ModalFormDataComponent,
  ChildrenFormComponent,
  FormErrorPipe,
  ImgUrlPipe,
  DeviceMode,
  Number2Float,
  Lower2Upper,
  CheckboxSelect,
  StringSort
];
@NgModule({
  imports: [
    ...imports
  ],
  declarations: [
    ...declarations,
    InTagComponent,
  ],
  exports: [
    ...imports,
    ...declarations
  ]
})
export class SharedModule { }
