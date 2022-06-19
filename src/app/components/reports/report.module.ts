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

FusionChartsModule.fcRoot(FusionCharts, Charts);

@NgModule({
  declarations: [FarmersRegistrationReportComponent, FarmersApprovalProgressComponent],
  imports: [
    CommonModule,
    ReportRoutingModule,
    FusionChartsModule, GoogleChartsModule,
    SharedModule
  ]
})
export class ReportModule {
}
