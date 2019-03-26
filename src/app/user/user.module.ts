import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { UserCreateComponent } from './user-create/user-create.component';
import {SharedModule} from '../shared';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [UserListComponent, UserEditComponent, UserCreateComponent],
  imports: [
    CommonModule,
    UserRoutingModule,
    SharedModule,
    RouterModule
  ], exports: [
    UserRoutingModule
  ]
})
export class UserModule { }
