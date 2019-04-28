import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {FarmersReportComponent} from './farmers-report/farmers-report.component';

const routes: Routes =  [
  {
    path: 'admin/report',
    component: AdminComponent,
    children: [
      {
        path: 'farmers',
        component: FarmersReportComponent
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }

