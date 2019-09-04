import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OrganisationListComponent} from './organisation-list/organisation-list.component';
import {AdminComponent} from '../admin/admin/admin.component';
import {OrganisationCreateComponent} from './organisation-create/organisation-create.component';
import {OrganisationEditComponent} from './organisation-edit/organisation-edit.component';
import {OrganisationFarmersComponent} from './organisation-farmers/organisation-farmers.component';
import {OrganisationPendingFarmersComponent} from './organisation-pending-farmers/organisation-pending-farmers.component';
import {AdminGuard} from '../core/services/guards/admin.guard';
import {CoveredAreaResolverService} from '../core/services/resolvers/covered-area-resolver.service';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'organisations',
        component: OrganisationListComponent
      }, {
        path: 'organisations/create',
        component: OrganisationCreateComponent
      }, {
        path: 'organisations/edit/:id',
        component: OrganisationEditComponent,
      }, {
        path: 'cws-farmers/:organisationId',
        component: OrganisationFarmersComponent
      }, {
        path: 'cws-pending-farmers/:organisationId',
        component: OrganisationPendingFarmersComponent,
      }, {
        path: 'organisations/:organisationId/farmers',
        component: OrganisationFarmersComponent,
        resolve: {orgCoveredAreaData: CoveredAreaResolverService}
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
