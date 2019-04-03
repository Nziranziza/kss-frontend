import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FarmerRoutingModule } from './farmer-routing.module';
import { FarmerListComponent } from './farmer-list/farmer-list.component';
import { FarmerEditComponent } from './farmer-edit/farmer-edit.component';
import {SharedModule} from '../shared';
import { RequestEditComponent } from './request-edit/request-edit.component';

@NgModule({
  declarations: [FarmerListComponent, FarmerEditComponent, RequestEditComponent],
  imports: [
    CommonModule,
    FarmerRoutingModule,
    SharedModule
  ]
})
export class FarmerModule { }
