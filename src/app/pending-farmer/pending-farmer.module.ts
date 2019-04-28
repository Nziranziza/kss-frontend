import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PendingFarmerRoutingModule } from './pending-farmer-routing.module';
import { PendingFarmerListComponent } from './pending-farmer-list/pending-farmer-list.component';
import { PendingFarmerDetailComponent } from './pending-farmer-detail/pending-farmer-detail.component';
import {SharedModule} from '../shared';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [PendingFarmerListComponent, PendingFarmerDetailComponent],
  imports: [
    CommonModule,
    PendingFarmerRoutingModule,
    SharedModule, NgbModule
  ]
})
export class PendingFarmerModule { }
