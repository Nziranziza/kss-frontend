import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared';
import {InputDistributionRoutingModule} from './input-distribution-routing.module';
import {DistributionPlanComponent} from './distribution-plan/distribution-plan.component';
import {SiteDistributionComponent} from './site-distribution/site-distribution.component';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {RecordSiteStockOutComponent} from './site-view-stockout/site-stock-out/record-site-stock-out.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import {OrderModule} from 'ngx-order-pipe';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RecordSiteStockReturnComponent} from './site-view-stockout/site-stock-return/record-site-stock-return.component';
import {RecordDistributionComponent} from './site-distribution/record-distribution/record-distribution.component';
import {SiteViewDispatchComponent} from './site-view-dispatch/site-view-dispatch.component';
import {SitesModule} from './sites/sites.module';
import {EditRequestComponent} from './edit-request/edit-request.component';
import {WarehouseModule} from './warehouse/warehouse.module';
import {ConfirmDispatchComponent} from './site-view-dispatch/confirm-dispatch/confirm-dispatch.component';
import {SiteViewStockoutComponent} from './site-view-stockout/site-view-stockout.component';
import {DeliveryDetailsComponent} from './warehouse/warehouse-entries/delivery-details/delivery-details.component';
import {DistributionReportModule} from '../reports/distribution-report/distribution-report.module';
import {SiteDistributionListComponent} from './site-ditributions-list/site-distributions-list.component';
import { ApplyPesticideComponent } from './site-distribution/apply-pesticide/apply-pesticide.component';

@NgModule({
  declarations: [DistributionPlanComponent,
    SiteDistributionComponent,
    RecordSiteStockOutComponent,
    RecordSiteStockReturnComponent,
    RecordSiteStockReturnComponent,
    RecordDistributionComponent,
    SiteViewDispatchComponent,
    EditRequestComponent,
    ConfirmDispatchComponent,
    SiteViewStockoutComponent, SiteDistributionListComponent, ApplyPesticideComponent],
  imports: [
    CommonModule,
    NgbModule, NgxPaginationModule, OrderModule,
    SharedModule,
    BrowserAnimationsModule,
    InputDistributionRoutingModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    SitesModule,
    WarehouseModule,
    DistributionReportModule
  ],
  entryComponents: [RecordDistributionComponent, ConfirmDispatchComponent, ApplyPesticideComponent,
    RecordSiteStockReturnComponent, RecordSiteStockOutComponent, DeliveryDetailsComponent]
})
export class InputDistributionModule {
}
