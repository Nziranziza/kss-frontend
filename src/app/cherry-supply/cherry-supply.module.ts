import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CherrySupplyRoutingModule} from './cherry-supply-routing.module';
import {CherrySupplyComponent} from './cherry-supply/cherry-supply.component';
import {SharedModule} from '../shared';

@NgModule({
  declarations: [CherrySupplyComponent],
  imports: [
    CommonModule,
    CherrySupplyRoutingModule,
    SharedModule
  ]
})
export class CherrySupplyModule {
}
