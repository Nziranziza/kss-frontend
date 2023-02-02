import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DryProcessingRoutingModule} from './dry-processing-routing.module';
import {SharedModule} from '../../shared';
import {DmParchmentListDeliveriesComponent} from './dm-parchment-list-deliveries/dm-parchment-list-deliveries.component';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime-ex';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import {OrderModule} from 'ngx-order-pipe';
import {FusionChartsModule} from 'angular-fusioncharts';
import {GoogleChartsModule} from 'angular-google-charts';
import {PrepareGreenCoffeeComponent} from './prepare-green-coffee/prepare-green-coffee.component';
import {ListGreenCoffeeComponent} from './list-green-coffee/list-green-coffee.component';
import {EditDeliveryItemComponent} from './dm-parchment-list-deliveries/edit-delivery-item/edit-delivery-item.component';
import {AddCoffeeItemComponent} from './prepare-green-coffee/add-coffee-item/add-coffee-item.component';
import {AddResultsComponent} from './list-green-coffee/add-results/add-results.component';
import { ListCwsGreenCoffeeComponent } from './list-cws-green-coffee/list-cws-green-coffee.component';
import { ShowResultsComponent } from './list-cws-green-coffee/show-results/show-results.component';
import { GreenCoffeePrepareTransferComponent } from './green-coffee-prepare-transfer/green-coffee-prepare-transfer.component';
import { GreenCoffeeListTransfersComponent } from './green-coffee-list-transfers/green-coffee-list-transfers.component';

@NgModule({
    declarations: [DmParchmentListDeliveriesComponent, PrepareGreenCoffeeComponent,
        ListGreenCoffeeComponent, EditDeliveryItemComponent,
        AddCoffeeItemComponent,
        AddResultsComponent, ListCwsGreenCoffeeComponent, ShowResultsComponent,
        GreenCoffeePrepareTransferComponent, GreenCoffeeListTransfersComponent],
    imports: [
        CommonModule,
        DryProcessingRoutingModule, NgbModule, NgxPaginationModule, OrderModule,
        SharedModule, OwlDateTimeModule,
        FusionChartsModule, GoogleChartsModule,
        AutocompleteLibModule,
        OwlNativeDateTimeModule,
        OwlNativeDateTimeModule, BrowserAnimationsModule
    ]
})
export class DryProcessingModule {
}
