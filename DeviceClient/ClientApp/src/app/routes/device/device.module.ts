import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceComponent } from './device.component';
import { SharedModule } from '../../shared/shared.module';
import { DeviceRoutingModule } from './device.routing';
import { WorkModeComponent } from './work-mode/work-mode.component';
import { CorrectionComponent } from './correction/correction.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    DeviceRoutingModule,
  ],
  declarations: [DeviceComponent, WorkModeComponent, CorrectionComponent]
})
export class DeviceModule { }
