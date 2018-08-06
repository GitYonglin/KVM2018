import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TensionComponent } from './tension.component';

const routes: Routes = [
  { path: '', component: TensionComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TensionRoutingModule {}
