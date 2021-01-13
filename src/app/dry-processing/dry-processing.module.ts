import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DryProcessingRoutingModule } from './dry-processing-routing.module';
import { CreateBatchComponent } from './create-batch/create-batch.component';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../shared';

@NgModule({
  declarations: [CreateBatchComponent],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    DryProcessingRoutingModule
  ]
})
export class DryProcessingModule { }
