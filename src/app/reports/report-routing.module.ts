import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {FarmersReportComponent} from './farmers-report/farmers-report.component';
import {AdminGuard} from '../core/services/guards/admin.guard';
import {FarmersApprovalProgressComponent} from './farmers-approval-progress/farmers-approval-progress.component';

const routes: Routes =  [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'report/farmers',
        component: FarmersReportComponent
      },
      {
        path: 'farmers/approval/progress',
        component: FarmersApprovalProgressComponent
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }

