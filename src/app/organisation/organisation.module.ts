import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganisationRoutingModule } from './organisation-routing.module';
import { OrganisationListComponent } from './organisation-list/organisation-list.component';
import { OrganisationEditComponent } from './organisation-edit/organisation-edit.component';
import { OrganisationCreateComponent } from './organisation-create/organisation-create.component';
import {SharedModule} from '../shared';


@NgModule({
  declarations: [OrganisationListComponent, OrganisationEditComponent, OrganisationCreateComponent],
  imports: [
    CommonModule,
    OrganisationRoutingModule,
    SharedModule
  ]
})
export class OrganisationModule { }
