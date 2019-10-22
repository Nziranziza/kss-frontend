import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FarmerRoutingModule} from './farmer-routing.module';
import {FarmerListComponent} from './farmer-list/farmer-list.component';
import {SharedModule} from '../shared';
import {FarmerDetailsComponent} from './farmer-details/farmer-details.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import {OrderModule} from 'ngx-order-pipe';
import {FarmerCreateComponent} from './farmer-create/farmer-create.component';
import {FarmerEditComponent} from './farmer-edit/farmer-edit.component';
import {FarmerLandsComponent} from './farmer-lands/farmer-lands.component';
import {EditFarmerProfileComponent} from './farmer-edit/edit-farmer-profile/edit-farmer-profile.component';
import {EditFarmerRequestComponent} from './farmer-edit/edit-farmer-request/edit-farmer-request.component';
import {AddFarmerRequestComponent} from './farmer-edit/add-farmer-request/add-farmer-request.component';
import {FarmerNeedApprovalListComponent} from './farmer-need-approval-list/farmer-need-approval-list.component';

@NgModule({
  declarations: [FarmerListComponent, FarmerDetailsComponent, FarmerCreateComponent,
    FarmerEditComponent, FarmerLandsComponent,
    EditFarmerProfileComponent, EditFarmerRequestComponent,
    AddFarmerRequestComponent, FarmerNeedApprovalListComponent],
  imports: [
    CommonModule,
    FarmerRoutingModule,
    SharedModule, NgbModule, NgxPaginationModule, OrderModule
  ],
  exports: [FarmerDetailsComponent],
  entryComponents: [FarmerDetailsComponent, AddFarmerRequestComponent, EditFarmerRequestComponent, EditFarmerProfileComponent]
})
export class FarmerModule {
}
