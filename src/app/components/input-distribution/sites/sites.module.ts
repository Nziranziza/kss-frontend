import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SiteListComponent} from './site-list/site-list.component';
import {SiteCreateComponent} from './site-create/site-create.component';
import {SiteEditComponent} from './site-edit/site-edit.component';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../../../shared';
import {SitesRoutingModule} from './sites-routing.module';
import {OrganisationRoutingModule} from '../../organisation/organisation-routing.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import {OrderModule} from 'ngx-order-pipe';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime-ex';
import {DataTablesModule} from 'angular-datatables';
import {SiteFarmersComponent} from './site-farmers/site-farmers.component';
import {SitePendingFarmersComponent} from './site-pending-farmers/site-pending-farmers.component';
import {SiteDetailsComponent} from './site-details/site-details.component';
import { DeleteSiteModal } from './delete-site-modal/delete-site-modal-component';
import { SiteDispatchPlanComponent } from './site-dispatch-plan/site-dispatch-plan.component';

@NgModule({
    declarations: [SiteListComponent, SiteCreateComponent,
        SiteEditComponent, SiteFarmersComponent, SitePendingFarmersComponent, SiteDetailsComponent, DeleteSiteModal, SiteDispatchPlanComponent],
    imports: [
        CommonModule,
        OrganisationRoutingModule,
        RouterModule,
        NgbModule, NgxPaginationModule,
        OrderModule,
        SharedModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        SitesRoutingModule,
        DataTablesModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class SitesModule {
}
