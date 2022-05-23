import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DistributionReportRoutingModule} from './distribution-report-routing.module';
import {DispatchProgressComponent} from './dispatch-progress/dispatch-progress.component';
import {FertilizerDistributionProgressComponent} from './fertilizer-distribution-progress/fertilizer-distribution-progress.component';
import {SharedModule} from '../../../shared';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {FusionChartsModule} from 'angular-fusioncharts';
import {GoogleChartsModule} from 'angular-google-charts';
import {PesticideDistributionProgressComponent} from './pesticide-distribution-progress/pesticide-distribution-progress.component';

@NgModule({
  declarations: [DispatchProgressComponent, FertilizerDistributionProgressComponent, PesticideDistributionProgressComponent],
  imports: [
    CommonModule,
    SharedModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    DistributionReportRoutingModule,
    FusionChartsModule, GoogleChartsModule
  ]
})
export class DistributionReportModule {
}
