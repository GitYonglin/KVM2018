import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectComponent } from './project.component';
import { SharedModule } from '../../shared/shared.module';
import { ProjectRoutingModule } from './project.routing';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ProjectRoutingModule,
  ],
  declarations: [ProjectComponent]
})
export class ProjectModule { }
