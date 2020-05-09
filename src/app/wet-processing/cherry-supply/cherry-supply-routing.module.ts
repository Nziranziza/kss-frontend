import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CherrySupplyComponent} from './cherry-supply/cherry-supply.component';
import {AdminGuard} from '../../core/services/guards/admin.guard';
import {AdminComponent} from '../../admin/admin/admin.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'cherries/supply/select/:regNumber',
        component: CherrySupplyComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CherrySupplyRoutingModule {
}
