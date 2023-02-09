import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserRoutingModule} from './user-routing.module';
import {UserListComponent} from './user-list/user-list.component';
import {UserEditComponent} from './user-edit/user-edit.component';
import {UserCreateComponent} from './user-create/user-create.component';
import {SharedModule} from '../../shared';
import {RouterModule} from '@angular/router';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime-ex';
import {UserDetailsComponent} from './user-details/user-details.component';
import { ChangeUserOrgComponent } from './change-user-org/change-user-org.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

@NgModule({
    declarations: [UserListComponent, UserEditComponent, UserCreateComponent, UserDetailsComponent, ChangeUserOrgComponent],
    imports: [
        CommonModule,
        UserRoutingModule,
        SharedModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        RouterModule,
        AutocompleteLibModule
    ],
    exports: [
        UserRoutingModule
    ]
})
export class UserModule {
}
