import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrganisationTypeRoutingModule} from './organisation-type-routing.module';
import {OrganisationTypeListComponent} from './organisation-type-list/organisation-type-list.component';
import {OrganisationTypeCreateComponent} from './organisation-type-create/organisation-type-create.component';
import {OrganisationTypeEditComponent} from './organisation-type-edit/organisation-type-edit.component';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../shared';

@NgModule({
  declarations: [OrganisationTypeListComponent, OrganisationTypeCreateComponent, OrganisationTypeEditComponent],
  imports: [
    CommonModule,
    OrganisationTypeRoutingModule,
    RouterModule,
    SharedModule
  ]
})
export class OrganisationTypeModule {
}
