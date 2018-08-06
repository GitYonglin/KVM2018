import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeviceSetComponent } from './device-set.component';

const routes: Routes = [
  { path: '', component: DeviceSetComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeviceSetRoutingModule {}
