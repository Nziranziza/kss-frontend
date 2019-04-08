import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FarmerRoutingModule} from './farmer-routing.module';
import {FarmerListComponent} from './farmer-list/farmer-list.component';
import {FarmerEditComponent} from './farmer-edit/farmer-edit.component';
import {SharedModule} from '../shared';
import {RequestEditComponent} from './request-edit/request-edit.component';
import {FarmerDetailsComponent} from './farmer-details/farmer-details.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [FarmerListComponent, FarmerEditComponent, RequestEditComponent, FarmerDetailsComponent],
  imports: [
    CommonModule,
    FarmerRoutingModule,
    SharedModule, NgbModule
  ],
  exports: [FarmerDetailsComponent],
  entryComponents: [FarmerDetailsComponent]
})
export class FarmerModule {
}
