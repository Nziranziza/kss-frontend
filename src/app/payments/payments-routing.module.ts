import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {AdminGuard} from '../core/services/guards/admin.guard';
import {OrganisationTopUpsComponent} from './organisation-top-ups/organisation-top-ups.component';
import {OrganisationPaymentsHistoryComponent} from './organisation-payments-history/organisation-payments-history.component';
import {OrganisationPayTopUpsComponent} from './organisation-pay-top-ups/organisation-pay-top-ups.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'top-ups/payments/:organisationId',
        component: OrganisationTopUpsComponent,
      },
      {
        path: 'history/payments/:organisationId',
        component: OrganisationPaymentsHistoryComponent
      },
      {
        path: 'top-ups/pay/:organisationId',
        component: OrganisationPayTopUpsComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentsRoutingModule {
}
