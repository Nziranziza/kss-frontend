import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrganisationPayFarmersRoutingModule} from './organisation-pay-farmers-routing.module';
import {SelectDeliveriesComponent} from './pay-farmers/select-deliveries/select-deliveries.component';
import {SharedModule} from '../../../shared';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime-ex';
import {RouterModule} from '@angular/router';
import {PayFarmersComponent} from './pay-farmers/pay-farmers.component';
import {PreviewDeliveriesListComponent} from './pay-farmers/preview-deliveries-list/preview-deliveries-list.component';
import {ConfirmPaymentComponent} from './pay-farmers/confirm-payment/confirm-payment.component';
import {PaySingleFarmerComponent} from './pay-single-farmer/pay-single-farmer.component';
import {FusionChartsModule} from 'angular-fusioncharts';
import {GoogleChartsModule} from 'angular-google-charts';

@NgModule({
    declarations: [SelectDeliveriesComponent, PayFarmersComponent,
        PreviewDeliveriesListComponent, ConfirmPaymentComponent, PaySingleFarmerComponent],
    imports: [
        CommonModule,
        OrganisationPayFarmersRoutingModule,
        SharedModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        RouterModule,
        FusionChartsModule,
        GoogleChartsModule, OwlDateTimeModule
    ],
    exports: [PaySingleFarmerComponent]
})
export class OrganisationPayFarmersModule {
}
