import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ReportRoutingModule} from './report-routing.module';
import {FarmersReportComponent} from './farmers-report/farmers-report.component';

import {FusionChartsModule} from 'angular-fusioncharts';
import * as FusionCharts from 'fusioncharts';
import * as Charts from 'fusioncharts/fusioncharts.charts';
import {GoogleChartsModule} from 'angular-google-charts';
import {SharedModule} from '../shared';

FusionChartsModule.fcRoot(FusionCharts, Charts);

@NgModule({
  declarations: [FarmersReportComponent],
  imports: [
    CommonModule,
    ReportRoutingModule,
    FusionChartsModule, GoogleChartsModule,
    SharedModule
  ]
})
export class ReportModule {
}
