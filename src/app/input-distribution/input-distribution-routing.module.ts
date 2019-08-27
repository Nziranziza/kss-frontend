import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {DistributionPlanComponent} from './distribution-plan/distribution-plan.component';
import {SiteDistributionComponent} from './site-distribution/site-distribution.component';
import {RecordSiteStockOutComponent} from './site-view-dispatch/site-stock-out/record-site-stock-out.component';
import {WarehouseDispatchComponent} from './warehouse/warehouse-dispatch/warehouse-dispatch.component';
import {SiteViewDispatchComponent} from './site-view-dispatch/site-view-dispatch.component';
import {SiteViewStockoutComponent} from './site-view-stockout/site-view-stockout.component';

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
        path: 'input/site/dispatches',
        component: SiteViewDispatchComponent
      },
      {
        path: 'input/site/stock-outs',
        component: SiteViewStockoutComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InputDistributionRoutingModule {
}
