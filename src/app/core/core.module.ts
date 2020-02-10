import {NgModule} from '@angular/core';
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
import {InputDistributionService} from './services';
import {WarehouseService} from './services';
import {AdminGuard} from './services/guards/admin.guard';
import {CoveredAreaResolverService} from './services/resolvers/covered-area-resolver.service';
import {SharedDataService} from './services/shared-data.service';

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
    SharedDataService,
    AdminGuard,
    CookieService,
    CoveredAreaResolverService,
    /*{provide: ErrorHandler, useClass: ErrorCustomHandler}*/
  ],
  declarations: []
})
export class CoreModule {
}
