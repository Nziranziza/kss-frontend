import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {UserListComponent} from './user-list/user-list.component';
import {UserCreateComponent} from './user-create/user-create.component';
import {UserEditComponent} from './user-edit/user-edit.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'organisations/:organisationId/users',
        component: UserListComponent
      },
      {
        path: 'organisations/:organisationId/users/create',
        component: UserCreateComponent
      },
      {
        path: 'organisations/:organisationId/users/edit/:id',
        component: UserEditComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {
}
