import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../../admin/admin/admin.component';
import {DispatchProgressComponent} from './dispatch-progress/dispatch-progress.component';
import {FertilizerDistributionProgressComponent} from './fertilizer-distribution-progress/fertilizer-distribution-progress.component';
import {PesticideDistributionProgressComponent} from './pesticide-distribution-progress/pesticide-distribution-progress.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'input/application/progress',
        component: FertilizerDistributionProgressComponent
      },
      {
        path: 'input/pesticide/application/progress',
        component: PesticideDistributionProgressComponent
      },
      {
        path: 'input/distribution/progress',
        component: DispatchProgressComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DistributionReportRoutingModule { }
