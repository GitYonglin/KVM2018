import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { ManualComponent } from './manual.component';
import { SharedModule } from '../../shared/shared.module';
import { ManualRoutingModule } from './manual.routing';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ManualRoutingModule
  ],
  declarations: []
})
export class ManualModule { }
