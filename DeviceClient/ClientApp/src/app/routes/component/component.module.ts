import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentComponent } from './component.component';
import { SharedModule } from '../../shared/shared.module';
import { ComponentRoutingModule } from './component.routing';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ComponentRoutingModule
  ],
  declarations: [ComponentComponent]
})
export class ComponentModule { }
