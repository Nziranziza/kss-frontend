import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FarmerRoutingModule} from './farmer-routing.module';
import {FarmerListComponent} from './farmer-list/farmer-list.component';
import {SharedModule} from '../shared';
import {FarmerDetailsComponent} from './farmer-details/farmer-details.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FarmerRequestEditComponent} from './farmer-request-edit/farmer-request-edit.component';
import {NgxPaginationModule} from 'ngx-pagination';
import {OrderModule} from 'ngx-order-pipe';


@NgModule({
  declarations: [FarmerListComponent, FarmerRequestEditComponent, FarmerDetailsComponent],
  imports: [
    CommonModule,
    FarmerRoutingModule,
    SharedModule, NgbModule, NgxPaginationModule, OrderModule
  ],
  exports: [FarmerDetailsComponent],
  entryComponents: [FarmerDetailsComponent]
})
export class FarmerModule {
}
