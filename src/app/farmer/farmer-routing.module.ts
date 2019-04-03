import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {FarmerEditComponent} from './farmer-edit/farmer-edit.component';
import {FarmerListComponent} from './farmer-list/farmer-list.component';

const routes: Routes = [
  {
    path: 'admin/farmers',
    component: AdminComponent,
    children: [
      {
        path: '',
        component: FarmerListComponent
      }, {
        path: 'edit/:id',
        component: FarmerEditComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FarmerRoutingModule { }
