import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {RegistrationReportComponent} from './registration-report/registration-report.component';

const routes: Routes =  [
  {
    path: 'admin/registration-reports',
    component: AdminComponent,
    children: [
      {
        path: '',
        component: RegistrationReportComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistrationReportRoutingModule { }

