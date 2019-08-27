import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {PendingFarmerListComponent} from './pending-farmer-list/pending-farmer-list.component';
import {AdminGuard} from '../core/services/guards/admin.guard';

const routes: Routes = [
  {
    path: 'admin/pending-farmers',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: '',
        component: PendingFarmerListComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PendingFarmerRoutingModule { }
