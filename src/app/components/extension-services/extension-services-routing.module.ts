import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {AdminGuard} from '../../core/guards/admin.guard';
import {FarmerGroupCreateComponent} from './groups/farmer-group-create/farmer-group-create.component';
import {FarmerGroupListComponent} from './groups/farmer-group-list/farmer-group-list.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'farmers/group/create',
        component: FarmerGroupCreateComponent
      },
      {
        path: 'farmers/group/list',
        component: FarmerGroupListComponent
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExtensionServicesRoutingModule { }
