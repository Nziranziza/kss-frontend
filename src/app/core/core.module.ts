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
  OrganisationTypeService,
} from './services';

import {HelperService} from './helpers';
import {CookieService} from 'ngx-cookie-service';
import {MessageService} from './services';
import {InputDistributionService} from './services';
import {WarehouseService} from './services';
import {AdminGuard} from './guards/admin.guard';
import {CoveredAreaResolverService} from './resolvers/covered-area-resolver.service';
import {SharedDataService} from './services/shared-data.service';
import {PaymentService} from './services/payment.service';
import {FarmService} from './services';
import {ConfirmDialogComponent} from './services/layouts/confirm-dialog/confirm-dialog.component';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
  imports: [

    CommonModule, BrowserAnimationsModule, MatDialogModule, MatIconModule

  ],
  providers: [
    ApiService,
    JwtService,
    AuthenticationService,
    OrganisationService,
    HelperService,
    FarmerService,
    FarmService,
    ConfirmDialogService,
    OrganisationTypeService,
    CookieService,
    MessageService,
    InputDistributionService,
    WarehouseService,
    SharedDataService,
    AdminGuard,
    CookieService,
    PaymentService,
    CoveredAreaResolverService,
    FarmService,
    /*{provide: ErrorHandler, useClass: ErrorCustomHandler}*/
  ],
  declarations: [ConfirmDialogComponent],
  entryComponents: [ConfirmDialogComponent]
})
export class CoreModule {
}
