import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {CreateBatchComponent} from './create-batch/create-batch.component';
import {AdminGuard} from '../core/services/guards/admin.guard';
import {DmParchmentListTransfersComponent} from './dm-parchment-list-transfers/dm-parchment-list-transfers.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'drymill/batch/create',
        component: CreateBatchComponent
      },
      {
        path: 'drymill/parchment/list',
        component: DmParchmentListTransfersComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DryProcessingRoutingModule {
}
