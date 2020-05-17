import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {OrganisationPayFarmersRoutingModule} from './organisation-pay-farmers-routing.module';
import {SelectDeliveriesComponent} from './select-deliveries/select-deliveries.component';
import {SharedModule} from '../../shared';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {RouterModule} from '@angular/router';
import {PayFarmersComponent} from './pay-farmers/pay-farmers.component';
import {PreviewDeliveriesListComponent} from './preview-deliveries-list/preview-deliveries-list.component';
import {ConfirmPaymentComponent} from './confirm-payment/confirm-payment.component';

@NgModule({
  declarations: [SelectDeliveriesComponent, PayFarmersComponent,
    PreviewDeliveriesListComponent, ConfirmPaymentComponent],
  imports: [
    CommonModule,
    OrganisationPayFarmersRoutingModule,
    SharedModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    RouterModule
  ],
  exports: [PayFarmersComponent],
  entryComponents: [PayFarmersComponent]

})
export class OrganisationPayFarmersModule {
}
