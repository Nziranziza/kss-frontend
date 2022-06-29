import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtensionServicesRoutingModule } from './extension-services-routing.module';
import { SharedModule } from '../../shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { FarmerGroupListComponent } from './groups/farmer-group-list/farmer-group-list.component';
import { FarmerGroupCreateComponent } from './groups/farmer-group-create/farmer-group-create.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { GapListComponent } from './gaps/gap-list/gap-list.component';
import { GapCreateComponent } from './gaps/gap-create/gap-create.component';
import { GapDeleteModal } from './gaps/gap-delete-modal/gap-delete-modal.component';
import { GapEditComponent } from './gaps/gap-edit/gap-edit.component';
import { TrainingListComponent } from './training/training-list/training-list.component';
import { TrainingCreateComponent } from './training/training-create/training-create.component';
import { TrainingSchedulingCreateComponent } from './training/training-scheduling-create/training-scheduling-create.component';
import { TrainingSchedulingListComponent } from './training/training-scheduling-list/training-scheduling-list.component';
import { TrainingEditComponent } from './training/training-edit/training-edit.component';
import { TrainingDeleteModal } from './training/training-delete-modal/training-delete-modal.component';
import { TrainingViewComponent } from './training/training-view/training-view.component';
import { ScheduleFarmVisitComponent } from './farm-visit/schedule-farm-visit/schedule-farm-visit.component';
import { EditFarmVisitComponent } from './farm-visit/edit-farm-visit/edit-farm-visit.component';
import { DeleteFarmVisitComponent } from './farm-visit/delete-farm-visit/delete-farm-visit.component';
import { ViewFarmVisitComponent } from './farm-visit/view-farm-visit/view-farm-visit.component';
import { FarmVisitListComponent } from './farm-visit/farm-visit-list/farm-visit-list.component';
import { AmazingTimePickerModule } from 'amazing-time-picker'; 
@NgModule({
  declarations: [
    FarmerGroupListComponent,
    FarmerGroupCreateComponent,
    GapListComponent,
    GapCreateComponent,
    GapEditComponent,
    GapDeleteModal,
    TrainingListComponent,
    TrainingCreateComponent,
    TrainingSchedulingCreateComponent,
    TrainingSchedulingListComponent,
    TrainingEditComponent,
    TrainingDeleteModal,
    TrainingViewComponent,
    ScheduleFarmVisitComponent,
    EditFarmVisitComponent,
    DeleteFarmVisitComponent,
    ViewFarmVisitComponent,
    FarmVisitListComponent
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
    AmazingTimePickerModule,
  ],
  entryComponents: [GapDeleteModal, TrainingDeleteModal],
})
export class ExtensionServicesModule {}
