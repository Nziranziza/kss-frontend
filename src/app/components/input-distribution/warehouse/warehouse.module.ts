import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WarehouseEntriesComponent} from './warehouse-entries/warehouse-entries.component';
import {SharedModule} from '../../../shared';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {DataTablesModule} from 'angular-datatables';
import {WarehouseRoutingModule} from './warehouse-routing.module';
import {WarehouseDispatchComponent} from './warehouse-dispatch/warehouse-dispatch.component';
import {DeliveryDetailsComponent} from './warehouse-entries/delivery-details/delivery-details.component';
import { WarehouseDispatchEditComponent } from './warehouse-dispatch-edit/warehouse-dispatch-edit.component';

@NgModule({
  declarations: [WarehouseEntriesComponent, WarehouseDispatchComponent, DeliveryDetailsComponent, WarehouseDispatchEditComponent],
  imports: [
    CommonModule,
    SharedModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    DataTablesModule,
    WarehouseRoutingModule
  ],
  entryComponents: [WarehouseDispatchEditComponent]
})
export class WarehouseModule {
}
