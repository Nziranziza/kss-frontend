import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {HttpTokenInterceptor} from './interceptors';

import {
  ApiService,
  AuthGuard,
  JwtService,
  AuthenticationService, OrganisationService
} from './services';
import {HelperService} from './helpers';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true},
    ApiService,
    AuthGuard,
    JwtService,
    AuthenticationService,
    OrganisationService,
    HelperService,
  ],
  declarations: []
})
export class CoreModule {
}
