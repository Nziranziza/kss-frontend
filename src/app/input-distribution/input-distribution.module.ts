import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared';
import {InputDistributionRoutingModule} from './input-distribution-routing.module';
import {DistributionPlanComponent} from './distribution-plan/distribution-plan.component';
import {SiteDistributionComponent} from './site-distribution/site-distribution.component';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {RecordSiteStockOutComponent} from './record-site-stock-out/record-site-stock-out.component';
import {RecordDispatchComponent} from './record-dispatch/record-dispatch.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import {OrderModule} from 'ngx-order-pipe';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RecordSiteStockReturnComponent} from './record-site-stock-return/record-site-stock-return.component';
import {RecordDistributionComponent} from './site-distribution/record-distribution/record-distribution.component';
import {SiteViewDispatchComponent} from './site-view-dispatch/site-view-dispatch.component';
import {ReportComponent} from './report/report.component';
import {SitesModule} from './sites/sites.module';
import {EditRequestComponent} from './edit-request/edit-request.component';


@NgModule({
  declarations: [DistributionPlanComponent,
    SiteDistributionComponent,
    RecordSiteStockOutComponent,
    RecordDispatchComponent,
    RecordSiteStockReturnComponent,
    RecordDistributionComponent,
    SiteViewDispatchComponent,
    ReportComponent,
    EditRequestComponent],
  imports: [
    CommonModule,
    NgbModule, NgxPaginationModule, OrderModule,
    SharedModule, OwlDateTimeModule,
    BrowserAnimationsModule,
    InputDistributionRoutingModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    SitesModule
  ]
})
export class InputDistributionModule {
}
