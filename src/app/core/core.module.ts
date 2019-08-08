import {ErrorHandler, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {
  ApiService,
  AuthenticationService,
  ConfirmDialogService,
  FarmerService,
  JwtService,
  OrganisationService,
  OrganisationTypeService
} from './services';
import {HelperService} from './helpers';
import {MatDialogModule} from '@angular/material';
import {SharedModule} from '../shared';
import {CookieService} from 'ngx-cookie-service';
import {MessageService} from './services/message.service';
import {ErrorCustomHandler} from './handlers/ErrorCustomHandler';

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
    MessageService,
    {provide: ErrorHandler, useClass: ErrorCustomHandler}
  ],
  declarations: []
})
export class CoreModule {
}
