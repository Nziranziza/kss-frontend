import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CherrySupplyRoutingModule} from './cherry-supply-routing.module';
import {CherrySupplyComponent} from './cherry-supply/cherry-supply.component';
import {SharedModule} from '../shared';
import {FusionChartsModule} from 'angular-fusioncharts';
import {GoogleChartsModule} from 'angular-google-charts';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';

@NgModule({
  declarations: [CherrySupplyComponent],
  imports: [
    CommonModule,
    CherrySupplyRoutingModule, FusionChartsModule, GoogleChartsModule,
    SharedModule, OwlDateTimeModule,
    OwlNativeDateTimeModule,
  ]
})
export class CherrySupplyModule {
}
