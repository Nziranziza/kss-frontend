import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DryProcessingRoutingModule} from './dry-processing-routing.module';
import {SharedModule} from '../shared';
import {DmParchmentListDeliveriesComponent} from './dm-parchment-list-deliveries/dm-parchment-list-deliveries.component';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import {OrderModule} from 'ngx-order-pipe';
import {FusionChartsModule} from 'angular-fusioncharts';
import {GoogleChartsModule} from 'angular-google-charts';
import {PrepareGreenCoffeeComponent} from './prepare-green-coffee/prepare-green-coffee.component';
import {ListGreenCoffeeComponent} from './list-green-coffee/list-green-coffee.component';
import { EditDeliveryItemComponent } from './dm-parchment-list-deliveries/edit-delivery-item/edit-delivery-item.component';
import { AddCoffeeItemComponent } from './prepare-green-coffee/add-coffee-item/add-coffee-item.component';

@NgModule({
  declarations: [DmParchmentListDeliveriesComponent, PrepareGreenCoffeeComponent,
    ListGreenCoffeeComponent, EditDeliveryItemComponent, AddCoffeeItemComponent],
  imports: [
    CommonModule,
    DryProcessingRoutingModule, NgbModule, NgxPaginationModule, OrderModule,
    SharedModule, OwlDateTimeModule,
    FusionChartsModule, GoogleChartsModule,
    AutocompleteLibModule,
    OwlNativeDateTimeModule,
    OwlNativeDateTimeModule, BrowserAnimationsModule
  ],
  entryComponents: [
    EditDeliveryItemComponent,
    AddCoffeeItemComponent
  ]
})
export class DryProcessingModule {
}
