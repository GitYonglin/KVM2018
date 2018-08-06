import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectEditGuard } from './protect/edit-guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'tension', loadChildren: './tension/tension.module#TensionModule', pathMatch: 'full' },
  { path: 'manual', loadChildren: './manual/manual.module#ManualModule', pathMatch: 'full' },
  { path: 'deviceSet', loadChildren: './device-set/device-set.module#DeviceSetModule', pathMatch: 'full' },
  { path: 'task', loadChildren: './task/task.module#TaskModule', canDeactivate: [ProtectEditGuard] },
  { path: 'component', loadChildren: './component/component.module#ComponentModule', canDeactivate: [ProtectEditGuard]},
  { path: 'project', loadChildren: './project/project.module#ProjectModule', canDeactivate: [ProtectEditGuard]},
  { path: 'device', loadChildren: './device/device.module#DeviceModule', canDeactivate: [ProtectEditGuard]},
  { path: '**', redirectTo: 'login', },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
