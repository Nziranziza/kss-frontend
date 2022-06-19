import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {LoginRoutingModule} from './login-routing.module';
import {LoginComponent} from './login/login.component';
import {SharedModule} from '../../shared';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {RequestResetComponent} from './request-reset/request-reset.component';

@NgModule({
  declarations: [LoginComponent, ResetPasswordComponent, RequestResetComponent],
  imports: [
    CommonModule,
    LoginRoutingModule,
    SharedModule
  ]
})
export class LoginModule {
}
