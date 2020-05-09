import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PaymentsRoutingModule} from './payments-routing.module';
import {OrganisationTopUpsComponent} from './organisation-top-ups/organisation-top-ups.component';
import {SharedModule} from '../shared';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {RouterModule} from '@angular/router';
import { OrganisationPaymentsHistoryComponent } from './organisation-payments-history/organisation-payments-history.component';
import { OrganisationPayTopUpsComponent } from './organisation-pay-top-ups/organisation-pay-top-ups.component';

@NgModule({
  declarations: [OrganisationTopUpsComponent, OrganisationPaymentsHistoryComponent, OrganisationPayTopUpsComponent],
  imports: [
    CommonModule,
    PaymentsRoutingModule,
    SharedModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    RouterModule
  ],
})
export class PaymentsModule {
}
