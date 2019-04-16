import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegistrationReportRoutingModule } from './registration-report-routing.module';
import { RegistrationReportComponent } from './registration-report/registration-report.component';

import { FusionChartsModule } from 'angular-fusioncharts';
import * as FusionCharts from 'fusioncharts';
import * as Charts from 'fusioncharts/fusioncharts.charts';

FusionChartsModule.fcRoot(FusionCharts, Charts)

@NgModule({
  declarations: [RegistrationReportComponent],
  imports: [
    CommonModule,
    RegistrationReportRoutingModule,
    FusionChartsModule
  ]
})
export class RegistrationReportModule { }
