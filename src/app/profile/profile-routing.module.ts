import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {ProfileComponent} from './profile.component';
import {AdminGuard} from '../core/services/guards/admin.guard';

const routes: Routes = [
  {
    path: 'admin/users',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'profile',
        component: ProfileComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
