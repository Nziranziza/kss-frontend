import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {FarmerListComponent} from './farmer-list/farmer-list.component';
import {FarmerCreateComponent} from './farmer-create/farmer-create.component';
import {FarmerEditComponent} from './farmer-edit/farmer-edit.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'farmers',
        component: FarmerListComponent
      }, {
        path: 'farmers/edit/:id',
        component: FarmerEditComponent,
      }, {
        path: 'farmers/create',
        component: FarmerCreateComponent,
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
