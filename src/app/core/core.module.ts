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
import {MessageService} from './services';
import {ErrorCustomHandler} from './handlers/ErrorCustomHandler';
import {InputDistributionService} from './services';
import {WarehouseService} from './services';
import {AdminGuard} from './services/guards/admin.guard';
import {CoveredAreaResolverService} from './services/resolvers/covered-area-resolver.service';
import {RoleResolverService} from './services/resolvers/role-resolver.service';

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
    InputDistributionService,
    WarehouseService,
    AdminGuard,
    CookieService,
    CoveredAreaResolverService,
    RoleResolverService,
    {provide: ErrorHandler, useClass: ErrorCustomHandler}
  ],
  declarations: []
})
export class CoreModule {
}
