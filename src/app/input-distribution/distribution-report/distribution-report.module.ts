import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DistributionReportRoutingModule } from './distribution-report-routing.module';
import { ApplicationProgressComponent } from './application-progress/application-progress.component';
import { DistributionProgressComponent } from './distribution-progress/distribution-progress.component';

@NgModule({
  declarations: [ApplicationProgressComponent, DistributionProgressComponent],
  imports: [
    CommonModule,
    DistributionReportRoutingModule
  ]
})
export class DistributionReportModule { }
