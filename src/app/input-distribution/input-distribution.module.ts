import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared';
import {InputDistributionRoutingModule} from './input-distribution-routing.module';
import {DistributionPlanComponent} from './distribution-plan/distribution-plan.component';
import {SiteDistributionComponent} from './site-distribution/site-distribution.component';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {RecordSiteStockOutComponent} from './site-view-dispatch/site-stock-out/record-site-stock-out.component';
import {WarehouseDispatchComponent} from './warehouse/warehouse-dispatch/warehouse-dispatch.component';
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

@NgModule({
  declarations: [DistributionPlanComponent,
    SiteDistributionComponent,
    RecordSiteStockOutComponent,
    RecordSiteStockReturnComponent,
    RecordDistributionComponent,
    SiteViewDispatchComponent,
    EditRequestComponent,
    ConfirmDispatchComponent,
    SiteViewStockoutComponent],
  imports: [
    CommonModule,
    NgbModule, NgxPaginationModule, OrderModule,
    SharedModule, OwlDateTimeModule,
    BrowserAnimationsModule,
    InputDistributionRoutingModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    SitesModule,
    WarehouseModule
  ],
  entryComponents: [RecordDistributionComponent, ConfirmDispatchComponent,
    RecordSiteStockReturnComponent, RecordSiteStockOutComponent, DeliveryDetailsComponent]
})
export class InputDistributionModule {
}
