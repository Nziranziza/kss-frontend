import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {
  ApiService,
  AuthenticationService,
  ConfirmDialogService,
  JwtService,
  OrganisationService,
  OrganisationTypeService, PoliceService
} from './services';
import {HelperService} from './helpers';
import {MatDialogModule} from '@angular/material';
import {SharedModule} from '../shared';
import {FarmerService} from './services';
import {CookieService} from 'ngx-cookie-service';

@NgModule({
  imports: [
    CommonModule, BrowserAnimationsModule, SharedModule, MatDialogModule
  ],
  providers: [
    ApiService,
    JwtService,
    AuthenticationService,
    OrganisationService,
    HelperService,
    FarmerService,
    ConfirmDialogService,
    OrganisationTypeService,
    CookieService,
    PoliceService
  ],
  declarations: []
})
export class CoreModule {
}
