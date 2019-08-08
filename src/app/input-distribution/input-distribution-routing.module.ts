import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {DistributionPlanComponent} from './distribution-plan/distribution-plan.component';
import {SiteDistributionComponent} from './site-distribution/site-distribution.component';
import {RecordSiteStockOutComponent} from './record-site-stock-out/record-site-stock-out.component';
import {RecordDispatchComponent} from './record-dispatch/record-dispatch.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'input/site/record/stock/out',
        component: RecordSiteStockOutComponent
      },
      {
        path: 'input/distribution/plan',
        component: DistributionPlanComponent
      },
      {
        path: 'input/site/distribution',
        component: SiteDistributionComponent
      },
      {
        path: 'input/record/dispatch',
        component: RecordDispatchComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InputDistributionRoutingModule {
}
