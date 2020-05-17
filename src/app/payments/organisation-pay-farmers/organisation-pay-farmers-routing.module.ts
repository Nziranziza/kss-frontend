import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PayFarmersComponent} from './pay-farmers/pay-farmers.component';
import {SelectDeliveriesComponent} from './select-deliveries/select-deliveries.component';
import {PreviewDeliveriesListComponent} from './preview-deliveries-list/preview-deliveries-list.component';
import {ConfirmPaymentComponent} from './confirm-payment/confirm-payment.component';
import {AdminComponent} from '../../admin/admin/admin.component';
import {AdminGuard} from '../../core/services/guards/admin.guard';

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
          {path: 'select-deliveries', component: SelectDeliveriesComponent},
          {path: 'preview-deliveries', component: PreviewDeliveriesListComponent},
          {path: 'confirm-payment', component: ConfirmPaymentComponent}
        ]
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
