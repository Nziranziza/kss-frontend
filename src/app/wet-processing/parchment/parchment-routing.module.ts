import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../../admin/admin/admin.component';
import {ParchmentCreateComponent} from './parchment-create/parchment-create.component';
import {ParchmentListComponent} from './parchment-list/parchment-list.component';
import {ParchmentTransferComponent} from './parchment-transfer/parchment-transfer.component';
import {AdminGuard} from '../../core/services/guards/admin.guard';

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
        path: 'cws/parchments/transfer/:id',
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
