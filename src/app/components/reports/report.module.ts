import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReportRoutingModule} from './report-routing.module';
import {FarmersRegistrationReportComponent} from './farmers-registration-report/farmers-registration-report.component';
import {FusionChartsModule} from 'angular-fusioncharts';
import * as FusionCharts from 'fusioncharts';
import * as Charts from 'fusioncharts/fusioncharts.charts';
import {GoogleChartsModule} from 'angular-google-charts';
import {SharedModule} from '../../shared';
import {FarmersApprovalProgressComponent} from './farmers-approval-progress/farmers-approval-progress.component';
import {PaymentReportsComponent} from './payment-report/payment-reports.component';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime-ex';

FusionChartsModule.fcRoot(FusionCharts, Charts);

@NgModule({
  declarations: [FarmersRegistrationReportComponent, FarmersApprovalProgressComponent, PaymentReportsComponent],
  imports: [
    CommonModule,
    ReportRoutingModule,
    FusionChartsModule, GoogleChartsModule,
    SharedModule, OwlDateTimeModule, OwlNativeDateTimeModule
  ]
})
export class ReportModule {
}
