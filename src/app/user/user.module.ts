import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserRoutingModule} from './user-routing.module';
import {UserListComponent} from './user-list/user-list.component';
import {UserEditComponent} from './user-edit/user-edit.component';
import {UserCreateComponent} from './user-create/user-create.component';
import {SharedModule} from '../shared';
import {RouterModule} from '@angular/router';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {UserDetailsComponent} from './user-details/user-details.component';

@NgModule({
  declarations: [UserListComponent, UserEditComponent, UserCreateComponent, UserDetailsComponent],
  imports: [
    CommonModule,
    UserRoutingModule,
    SharedModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    RouterModule
  ],
  exports: [
    UserRoutingModule
  ],
  entryComponents: [
    UserDetailsComponent
  ]
})
export class UserModule {
}
