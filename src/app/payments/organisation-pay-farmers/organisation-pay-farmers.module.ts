import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganisationPayFarmersRoutingModule } from './organisation-pay-farmers-routing.module';
import { SelectDeliveriesComponent } from './select-deliveries/select-deliveries.component';
import {SharedModule} from '../../shared';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [SelectDeliveriesComponent],
  imports: [
    CommonModule,
    OrganisationPayFarmersRoutingModule,
    SharedModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    RouterModule
  ],
  exports: [SelectDeliveriesComponent],
  entryComponents: [SelectDeliveriesComponent]

})
export class OrganisationPayFarmersModule {
}
