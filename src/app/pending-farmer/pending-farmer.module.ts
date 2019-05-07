import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PendingFarmerRoutingModule } from './pending-farmer-routing.module';
import { PendingFarmerListComponent } from './pending-farmer-list/pending-farmer-list.component';
import {SharedModule} from '../shared';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import {OrderModule} from 'ngx-order-pipe';

@NgModule({
  declarations: [PendingFarmerListComponent],
  imports: [
    CommonModule,
    PendingFarmerRoutingModule,
    SharedModule, NgbModule, NgxPaginationModule, OrderModule
  ]
})
export class PendingFarmerModule { }
