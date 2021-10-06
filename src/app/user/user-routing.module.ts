import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {UserCreateComponent} from './user-create/user-create.component';
import {UserEditComponent} from './user-edit/user-edit.component';
import {UserListComponent} from './user-list/user-list.component';
import {AdminGuard} from '../core/services/guards/admin.guard';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'organisations/:organisationId/users/create',
        component: UserCreateComponent
      },
      {
        path: 'organisations/:organisationId/users/edit/:id',
        component: UserEditComponent
      },
      {
        path: 'organisations/:organisationId/users',
        component: UserListComponent,
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
