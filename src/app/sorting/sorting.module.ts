import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SortingRoutingModule} from './sorting-routing.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import {OrderModule} from 'ngx-order-pipe';
import {SharedModule} from '../shared';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {FusionChartsModule} from 'angular-fusioncharts';
import {GoogleChartsModule} from 'angular-google-charts';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SwListGreenCoffeesComponent} from './sw-list-green-coffees/sw-list-green-coffees.component';

@NgModule({
  declarations: [SwListGreenCoffeesComponent],
  imports: [
    CommonModule,
    SortingRoutingModule, NgbModule, NgxPaginationModule, OrderModule,
    SharedModule, OwlDateTimeModule,
    FusionChartsModule, GoogleChartsModule,
    AutocompleteLibModule,
    OwlNativeDateTimeModule,
    OwlNativeDateTimeModule, BrowserAnimationsModule
  ],
})
export class SortingModule {
}
