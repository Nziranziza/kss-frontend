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
import {ParchmentTransferComponent} from './parchment-transfer/parchment-transfer.component';
import {FusionChartsModule} from 'angular-fusioncharts';
import {GoogleChartsModule} from 'angular-google-charts';
import {ParchmentReportComponent} from '../../reports/parchment-report/parchment-report.component';
import {ParchmentReportDetailComponent} from '../../reports/parchment-report/parchment-report-detail/parchment-report-detail.component';
import {SharedModule} from '../../shared';

@NgModule({
  declarations: [ParchmentListComponent, ParchmentCreateComponent, ParchmentTransferComponent,
    ParchmentReportComponent, ParchmentReportDetailComponent],
  imports: [
    CommonModule,
    ParchmentRoutingModule, NgbModule, NgxPaginationModule, OrderModule,
    SharedModule, OwlDateTimeModule,
    FusionChartsModule, GoogleChartsModule,
    OwlNativeDateTimeModule,
    OwlNativeDateTimeModule, BrowserAnimationsModule
  ],
  exports: [ParchmentCreateComponent],
  entryComponents: [ParchmentCreateComponent, ParchmentReportDetailComponent]
})
export class ParchmentModule {
}
