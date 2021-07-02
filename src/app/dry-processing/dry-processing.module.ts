import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DryProcessingRoutingModule } from './dry-processing-routing.module';
import { CreateBatchComponent } from './create-batch/create-batch.component';

import {SharedModule} from '../shared';
import {DmParchmentListTransfersComponent} from './dm-parchment-list-transfers/dm-parchment-list-transfers.component';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import {OrderModule} from 'ngx-order-pipe';
import {FusionChartsModule} from 'angular-fusioncharts';
import {GoogleChartsModule} from 'angular-google-charts';

@NgModule({
  declarations: [CreateBatchComponent, DmParchmentListTransfersComponent],
  imports: [
    CommonModule,
    DryProcessingRoutingModule, NgbModule, NgxPaginationModule, OrderModule,
    SharedModule, OwlDateTimeModule,
    FusionChartsModule, GoogleChartsModule,
    AutocompleteLibModule,
    OwlNativeDateTimeModule,
    OwlNativeDateTimeModule, BrowserAnimationsModule
  ]
})
export class DryProcessingModule { }
