import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {FarmerListComponent} from './farmer-list/farmer-list.component';
import {FarmerRequestEditComponent} from './farmer-request-edit/farmer-request-edit.component';

const routes: Routes = [
  {
    path: 'admin/farmers',
    component: AdminComponent,
    children: [
      {
        path: '',
        component: FarmerListComponent
      }, {
        path: ':farmerId/request/edit/:id',
        component: FarmerRequestEditComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FarmerRoutingModule { }
