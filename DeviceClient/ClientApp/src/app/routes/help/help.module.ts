import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { HelpRoutingModule } from './help.routing';
import { HelpComponent } from './help.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    HelpRoutingModule
  ],
  declarations: [
    HelpComponent
  ]
})
export class HelpModule { }
