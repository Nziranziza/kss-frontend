import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {OrganisationTypeListComponent} from './organisation-type-list/organisation-type-list.component';
import {OrganisationTypeCreateComponent} from './organisation-type-create/organisation-type-create.component';
import {OrganisationTypeEditComponent} from './organisation-type-edit/organisation-type-edit.component';
import {OrganisationListComponent} from '../organisation/organisation-list/organisation-list.component';
import {AdminGuard} from '../../core/guards/admin.guard';

const routes: Routes = [
  {
    path: 'admin/organisation-types',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: '',
        component: OrganisationTypeListComponent
      }, {
        path: 'create',
        component: OrganisationTypeCreateComponent
      }, {
        path: 'edit/:id',
        component: OrganisationTypeEditComponent,
      },
      {
        path: ':organisationTypeId/organisations',
        component: OrganisationListComponent
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganisationTypeRoutingModule { }
