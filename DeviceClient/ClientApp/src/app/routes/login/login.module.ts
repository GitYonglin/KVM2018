import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { SharedModule } from '../../shared/shared.module';
import { LoginRoutingModule } from './login.routing';
import { AdminComponent } from './admin/admin.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    LoginRoutingModule
  ],
  declarations: [
    LoginComponent,
    AdminComponent
  ]
})
export class LoginModule { }
