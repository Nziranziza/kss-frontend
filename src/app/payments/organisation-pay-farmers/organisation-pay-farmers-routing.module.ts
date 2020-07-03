import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PayFarmersComponent} from './pay-farmers/pay-farmers.component';
import {SelectDeliveriesComponent} from './pay-farmers/select-deliveries/select-deliveries.component';
import {PreviewDeliveriesListComponent} from './pay-farmers/preview-deliveries-list/preview-deliveries-list.component';
import {ConfirmPaymentComponent} from './pay-farmers/confirm-payment/confirm-payment.component';
import {AdminComponent} from '../../admin/admin/admin.component';
import {AdminGuard} from '../../core/services/guards/admin.guard';
import {PaymentReportsComponent} from '../../reports/payment-report/payment-reports.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'pay-farmers',
        component: PayFarmersComponent,
        children: [
          {path: '', component: SelectDeliveriesComponent},
          {path: 'preview-deliveries', component: PreviewDeliveriesListComponent},
          {path: 'confirm-payment', component: ConfirmPaymentComponent}
        ]
      },
      {
        path: 'payment/reports',
        component: PaymentReportsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganisationPayFarmersRoutingModule {
}
