import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskComponent } from './task.component';
import { TaskRoutingModule } from './task.routing';
import { SharedModule } from '../../shared/shared.module';
import { SelectComponentComponent } from './select-component/select-component.component';
import { SelectDeviceComponent } from './select-device/select-device.component';
import { ManualGroupComponent } from './manual-group/manual-group.component';
import { SelectSteelStrandComponent } from './select-steel-strand/select-steel-strand.component';
import { GroupTaskDataComponent } from './group-task-data/group-task-data.component';
// import { CanvasCvsComponent } from './canvas-cvs/canvas-cvs.component';

@NgModule({
  imports: [
    CommonModule,
    TaskRoutingModule,
    SharedModule
  ],
  declarations: [
    TaskComponent,
    SelectComponentComponent,
    SelectDeviceComponent,
    ManualGroupComponent,
    SelectSteelStrandComponent,
    GroupTaskDataComponent,
    // CanvasCvsComponent
  ]
})
export class TaskModule { }
