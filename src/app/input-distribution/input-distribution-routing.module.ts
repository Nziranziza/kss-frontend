import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {DistributionPlanComponent} from './distribution-plan/distribution-plan.component';
import {SiteDistributionComponent} from './site-distribution/site-distribution.component';
import {RecordSiteStockOutComponent} from './site-view-stockout/site-stock-out/record-site-stock-out.component';
import {SiteViewDispatchComponent} from './site-view-dispatch/site-view-dispatch.component';
import {SiteViewStockoutComponent} from './site-view-stockout/site-view-stockout.component';
import {AdminGuard} from '../core/services/guards/admin.guard';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
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
        path: 'input/site/distribution/:siteId',
        component: SiteDistributionComponent
      },
      {
        path: 'input/site/dispatches/:siteId',
        component: SiteViewDispatchComponent
      },
      {
        path: 'input/site/stock-outs/:siteId',
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
