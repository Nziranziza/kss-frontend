import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtensionServicesRoutingModule } from './extension-services-routing.module';
import { SharedModule } from '../../shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { GoogleChartsModule } from 'angular-google-charts';
import { FarmerGroupListComponent } from './groups/farmer-group-list/farmer-group-list.component';
import { FarmerGroupCreateComponent } from './groups/farmer-group-create/farmer-group-create.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { GapListComponent } from './gaps/gap-list/gap-list.component';
import { GapCreateComponent } from './gaps/gap-create/gap-create.component';
import { GapDeleteModal } from './gaps/gap-delete-modal/gap-delete-modal.component';
import { GapEditComponent } from './gaps/gap-edit/gap-edit.component';
import { TrainingListComponent } from './training/training-list/training-list.component';
import { TrainingCreateComponent } from './training/training-create/training-create.component';

@NgModule({
  declarations: [
    FarmerGroupListComponent,
    FarmerGroupCreateComponent,
    GapListComponent,
    GapCreateComponent,
    GapEditComponent,
    GapDeleteModal,
    TrainingListComponent,
    TrainingCreateComponent
  ],
  imports: [
    CommonModule,
    ExtensionServicesRoutingModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    SharedModule,
    NgbModule,
    NgxPaginationModule,
    OrderModule,
  ],
  entryComponents: [GapDeleteModal],
})
export class ExtensionServicesModule {}
