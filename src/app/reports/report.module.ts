import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ReportRoutingModule} from './report-routing.module';
import {FarmersReportComponent} from './farmers-report/farmers-report.component';

import {FusionChartsModule} from 'angular-fusioncharts';
import * as FusionCharts from 'fusioncharts';
import * as Charts from 'fusioncharts/fusioncharts.charts';
import {GoogleChartsModule} from 'angular-google-charts';
import {SharedModule} from '../shared';
import {FarmersApprovalProgressComponent} from './farmers-approval-progress/farmers-approval-progress.component';

FusionChartsModule.fcRoot(FusionCharts, Charts);

@NgModule({
  declarations: [FarmersReportComponent, FarmersApprovalProgressComponent],
  imports: [
    CommonModule,
    ReportRoutingModule,
    FusionChartsModule, GoogleChartsModule,
    SharedModule
  ]
})
export class ReportModule {
}
