import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {FarmersRegistrationReportComponent} from './farmers-registration-report/farmers-registration-report.component';
import {AdminGuard} from '../../core/guards/admin.guard';
import {FarmersApprovalProgressComponent} from './farmers-approval-progress/farmers-approval-progress.component';
import {ParchmentReportComponent} from './parchment-report/parchment-report.component';

const routes: Routes =  [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'report/farmers',
        component: FarmersRegistrationReportComponent
      },
      {
        path: 'farmers/approval/progress',
        component: FarmersApprovalProgressComponent
      },
      {
        path: 'cherries/parchments/report',
        component: ParchmentReportComponent
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }

