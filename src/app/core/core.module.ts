import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {HttpTokenInterceptor} from './interceptors';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {
  ApiService,
  AuthGuard,
  JwtService,
  AuthenticationService, OrganisationService, ConfirmDialogService
} from './services';
import {HelperService} from './helpers';
import {MatDialogModule} from '@angular/material';
import {SharedModule} from '../shared';

@NgModule({
  imports: [
    CommonModule, BrowserAnimationsModule, SharedModule, MatDialogModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true},
    ApiService,
    AuthGuard,
    JwtService,
    AuthenticationService,
    OrganisationService,
    HelperService,
    ConfirmDialogService
  ],
  declarations: []
})
export class CoreModule {
}
