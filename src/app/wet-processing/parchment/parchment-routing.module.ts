import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../../admin/admin/admin.component';
import {ParchmentCreateComponent} from './parchment-create/parchment-create.component';
import {ParchmentListComponent} from './parchment-list/parchment-list.component';
import {AdminGuard} from '../../core/services/guards/admin.guard';
import {ParchmentPrepareTransferCartComponent} from './parchment-prepare-transfer-cart/parchment-prepare-transfer-cart.component';
import {ParchmentListTransfersComponent} from './parchment-list-transfers/parchment-list-transfers.component';
import {ParchmentEditComponent} from './parchment-edit/parchment-edit.component';
import {ListCwsGreenCoffeeComponent} from '../../dry-processing/list-cws-green-coffee/list-cws-green-coffee.component';

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
        path: 'cws/parchments/edit/:id',
        component: ParchmentEditComponent
      },
      {
        path: 'cws/parchments/transfer/history',
        component: ParchmentListTransfersComponent
      },
      {
        path: 'cws/greencoffee/list',
        component: ListCwsGreenCoffeeComponent
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
