import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ParchmentListComponent} from './parchment-list/parchment-list.component';
import {ParchmentCreateComponent} from './parchment-create/parchment-create.component';
import {ParchmentRoutingModule} from './parchment-routing.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import {OrderModule} from 'ngx-order-pipe';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FusionChartsModule} from 'angular-fusioncharts';
import {GoogleChartsModule} from 'angular-google-charts';
import {ParchmentReportComponent} from '../../reports/parchment-report/parchment-report.component';
import {ParchmentReportDetailComponent} from '../../reports/parchment-report/parchment-report-detail/parchment-report-detail.component';
import {SharedModule} from '../../shared';
import {ParchmentPrepareTransferCartComponent} from './parchment-prepare-transfer-cart/parchment-prepare-transfer-cart.component';
import {ParchmentListTransfersComponent} from './parchment-list-transfers/parchment-list-transfers.component';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { ParchmentEditComponent } from './parchment-edit/parchment-edit.component';

@NgModule({
  declarations: [ParchmentListComponent, ParchmentCreateComponent,
    ParchmentReportComponent,
    ParchmentReportDetailComponent,
    ParchmentPrepareTransferCartComponent, ParchmentListTransfersComponent, ParchmentEditComponent],
  imports: [
    CommonModule,
    ParchmentRoutingModule, NgbModule, NgxPaginationModule, OrderModule,
    SharedModule, OwlDateTimeModule,
    FusionChartsModule, GoogleChartsModule,
    AutocompleteLibModule,
    OwlNativeDateTimeModule,
    OwlNativeDateTimeModule, BrowserAnimationsModule
  ],
  exports: [ParchmentCreateComponent, ParchmentPrepareTransferCartComponent],
  entryComponents: [ParchmentCreateComponent, ParchmentReportDetailComponent]
})
export class ParchmentModule {
}
