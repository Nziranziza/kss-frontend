import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FarmerRoutingModule} from './farmer-routing.module';
import {FarmerListComponent} from './farmer-list/farmer-list.component';
import {SharedModule} from '../shared';
import {FarmerDetailsComponent} from './farmer-details/farmer-details.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import {OrderModule} from 'ngx-order-pipe';
import {FarmerCreateComponent } from './farmer-create/farmer-create.component';
import {FarmerEditProfileComponent } from './farmer-edit-profile/farmer-edit-profile.component';
import { FarmerLandsComponent } from './farmer-lands/farmer-lands.component';


@NgModule({
  declarations: [FarmerListComponent, FarmerDetailsComponent, FarmerCreateComponent, FarmerEditProfileComponent, FarmerLandsComponent],
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
