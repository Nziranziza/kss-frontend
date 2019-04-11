import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegistrationReportRoutingModule } from './registration-report-routing.module';
import { RegistrationReportComponent } from './registration-report/registration-report.component';

@NgModule({
  declarations: [RegistrationReportComponent],
  imports: [
    CommonModule,
    RegistrationReportRoutingModule
  ]
})
export class RegistrationReportModule { }
