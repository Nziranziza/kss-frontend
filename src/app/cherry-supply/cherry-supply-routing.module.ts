import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {CherrySupplyComponent} from './cherry-supply/cherry-supply.component';
import {CherrySupplyReportsComponent} from './cherry-supply-reports/cherry-supply-reports.component';
import {AdminGuard} from '../core/services/guards/admin.guard';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'cherries/supply/select/:regNumber',
        component: CherrySupplyComponent
      },
      {
        path: 'cherries/supply/reports',
        component: CherrySupplyReportsComponent
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
