import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ErrorPagesRoutingModule} from './error-pages-routing.module';
import {NotFoundComponent} from './not-found/not-found.component';
import {SharedModule} from '../../shared';

@NgModule({
  declarations: [NotFoundComponent],
  imports: [
    CommonModule,
    ErrorPagesRoutingModule,
    SharedModule
  ]
})
export class ErrorPagesModule {
}
