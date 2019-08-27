import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {FarmerListComponent} from './farmer-list/farmer-list.component';
import {FarmerCreateComponent} from './farmer-create/farmer-create.component';
import {FarmerEditComponent} from './farmer-edit/farmer-edit.component';
import {FarmerLandsComponent} from './farmer-lands/farmer-lands.component';
import {FarmerAdministrativeListComponent} from './farmer-administrative-list/farmer-administrative-list.component';
import {FarmerNeedApprovalListComponent} from './farmer-need-approval-list/farmer-need-approval-list.component';
import {AdminGuard} from '../core/services/guards/admin.guard';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'farmers/list',
        component: FarmerListComponent
      },
      {
        path: 'farmers/administrative/list',
        component: FarmerAdministrativeListComponent
      },
      {
        path: 'farmers/need-approval/list',
        component: FarmerNeedApprovalListComponent
      },
      {
        path: 'farmers/edit/:id',
        component: FarmerEditComponent,
      }, {
        path: 'farmers/create',
        component: FarmerCreateComponent,
      }, {
        path: 'farmers/:farmerId/lands',
        component: FarmerLandsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FarmerRoutingModule {
}
