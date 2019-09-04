import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DistributionReportRoutingModule} from './distribution-report-routing.module';
import {DispatchProgressComponent} from './dispatch-progress/dispatch-progress.component';
import {DistributionProgressComponent} from './distribution-progress/distribution-progress.component';
import {SharedModule} from '../../shared';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';

@NgModule({
  declarations: [DispatchProgressComponent, DistributionProgressComponent],
  imports: [
    CommonModule,
    SharedModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    DistributionReportRoutingModule
  ]
})
export class DistributionReportModule {
}
