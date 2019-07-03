import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParchmentListComponent } from './parchment-list/parchment-list.component';
import { ParchmentCreateComponent } from './parchment-create/parchment-create.component';
import {SharedModule} from '../shared';
import {ParchmentRoutingModule} from './parchment-routing.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import {OrderModule} from 'ngx-order-pipe';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ParchmentTransferComponent } from './parchment-transfer/parchment-transfer.component';

@NgModule({
  declarations: [ParchmentListComponent, ParchmentCreateComponent, ParchmentTransferComponent],
  imports: [
    CommonModule,
    ParchmentRoutingModule, NgbModule, NgxPaginationModule, OrderModule,
    SharedModule, OwlDateTimeModule,
    OwlNativeDateTimeModule, BrowserAnimationsModule
  ]
})
export class ParchmentModule {
}
