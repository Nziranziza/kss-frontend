import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../../admin/admin/admin.component';
import {DispatchProgressComponent} from './dispatch-progress/dispatch-progress.component';
import {DistributionProgressComponent} from './distribution-progress/distribution-progress.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'input/application/progress',
        component: DistributionProgressComponent
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
