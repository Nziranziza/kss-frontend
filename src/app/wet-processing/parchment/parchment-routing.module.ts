import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../../admin/admin/admin.component';
import {ParchmentCreateComponent} from './parchment-create/parchment-create.component';
import {ParchmentListComponent} from './parchment-list/parchment-list.component';
import {AdminGuard} from '../../core/services/guards/admin.guard';
import {ParchmentPrepareTransferCartComponent} from './parchment-prepare-transfer-cart/parchment-prepare-transfer-cart.component';
import {ParchmentListTransfersComponent} from './parchment-list-transfers/parchment-list-transfers.component';
import {ParchmentTransferComponent} from './parchment-transfer/parchment-transfer.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'cws/parchments/list',
        component: ParchmentListComponent
      }, {
        path: 'cws/parchments/create',
        component: ParchmentCreateComponent
      },
      {
        path: 'cws/parchments/transfer/cart',
        component: ParchmentPrepareTransferCartComponent
      },
      {
        path: 'cws/parchments/transfer/history',
        component: ParchmentListTransfersComponent
      },
      {
        path: 'cws/parchments/transfer/history/:id',
        component: ParchmentTransferComponent
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParchmentRoutingModule {
}
