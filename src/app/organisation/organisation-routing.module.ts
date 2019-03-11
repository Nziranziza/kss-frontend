import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {OrganisationListComponent} from './organisation-list/organisation-list.component';
import {AdminComponent} from '../admin/admin/admin.component';
import {OrganisationCreateComponent} from './organisation-create/organisation-create.component';
import {OrganisationEditComponent} from './organisation-edit/organisation-edit.component';

const routes: Routes = [
  {
    path: 'admin/organisations',
    component: AdminComponent,
    children: [
      {
        path: '',
        component: OrganisationListComponent
      }, {
        path: 'create',
        component: OrganisationCreateComponent
      }, {
        path: 'edit/:id',
        component: OrganisationEditComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class OrganisationRoutingModule {
}
