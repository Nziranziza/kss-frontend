import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PaymentsRoutingModule} from './payments-routing.module';
import {OrganisationTopUpsComponent} from './organisation-top-ups/organisation-top-ups.component';
import {SharedModule} from '../../shared';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime-ex';
import {RouterModule} from '@angular/router';
import {OrganisationPaymentsHistoryComponent} from './organisation-payments-history/organisation-payments-history.component';
import {OrganisationPayTopUpsComponent} from './organisation-pay-top-ups/organisation-pay-top-ups.component';
import {CoreModule} from '../../core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import {OrderModule} from 'ngx-order-pipe';
import {PaymentHistoryDetailsComponent} from './organisation-payments-history/payment-history-details/payment-history-details.component';

@NgModule({
  declarations: [OrganisationTopUpsComponent, OrganisationPaymentsHistoryComponent, OrganisationPayTopUpsComponent,
    PaymentHistoryDetailsComponent],
  imports: [
    CommonModule,
    PaymentsRoutingModule,
    NgbModule, NgxPaginationModule,
    OrderModule,
    SharedModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    RouterModule,
    CoreModule
  ],
  entryComponents: [PaymentHistoryDetailsComponent]
})
export class PaymentsModule {
}
