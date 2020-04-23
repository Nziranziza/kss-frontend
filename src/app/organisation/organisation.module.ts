import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrganisationRoutingModule} from './organisation-routing.module';
import {OrganisationListComponent} from './organisation-list/organisation-list.component';
import {OrganisationEditComponent} from './organisation-edit/organisation-edit.component';
import {OrganisationCreateComponent} from './organisation-create/organisation-create.component';
import {SharedModule} from '../shared';
import {RouterModule} from '@angular/router';
import {OrganisationFarmersComponent} from './organisation-farmers/organisation-farmers.component';
import {OrganisationPendingFarmersComponent} from './organisation-pending-farmers/organisation-pending-farmers.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import {OrderModule} from 'ngx-order-pipe';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';


@NgModule({
  declarations: [OrganisationListComponent, OrganisationEditComponent,
    OrganisationCreateComponent, OrganisationFarmersComponent, OrganisationPendingFarmersComponent],
  imports: [
    CommonModule,
    OrganisationRoutingModule,
    RouterModule,
    NgbModule, NgxPaginationModule,
    OrderModule,
    SharedModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule
  ],
  exports: [RouterModule]
})
export class OrganisationModule {
}
