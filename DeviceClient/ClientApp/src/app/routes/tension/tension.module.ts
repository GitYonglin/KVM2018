import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { TensionComponent } from './tension.component';
import { TensionRoutingModule } from './tension.routing';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TensionRoutingModule
  ],
  declarations: [
    TensionComponent
  ]
})
export class TensionModule { }
