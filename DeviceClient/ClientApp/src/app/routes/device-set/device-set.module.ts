import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceSetComponent } from './device-set.component';
import { SharedModule } from '../../shared/shared.module';
import { DeviceSetRoutingModule } from './device.set.routing';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    DeviceSetRoutingModule
  ],
  declarations: [DeviceSetComponent]
})
export class DeviceSetModule { }
