import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ExtensionServicesRoutingModule } from "./extension-services-routing.module";
import { SharedModule } from "../../shared";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxPaginationModule } from "ngx-pagination";
import { FarmerGroupListComponent } from "./groups/farmer-group-list/farmer-group-list.component";
import { FarmerGroupCreateComponent } from "./groups/farmer-group-create/farmer-group-create.component";
import {
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
} from "ng-pick-datetime-ex";
import { GapListComponent } from "./gaps/gap-list/gap-list.component";
import { GapCreateComponent } from "./gaps/gap-create/gap-create.component";
import { GapDeleteModal } from "./gaps/gap-delete-modal/gap-delete-modal.component";
import { GapEditComponent } from "./gaps/gap-edit/gap-edit.component";
import { FarmerGroupEditComponent } from "./groups/farmer-group-edit/farmer-group-edit.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { TrainingListComponent } from "./trainings/training-list/training-list.component";
import { TrainingCreateComponent } from "./trainings/training-create/training-create.component";
import { TrainingViewComponent } from "./trainings/training-view/training-view.component";
import { TrainingEditComponent } from "./trainings/training-edit/training-edit.component";
import { TrainingSchedulingCreateComponent } from "./schedules/training-scheduling-create/training-scheduling-create.component";
import { TrainingSchedulingListComponent } from "./schedules/training-scheduling-list/training-scheduling-list.component";
import { TrainingScheduleViewComponent } from "./schedules/training-schedule-view/training-schedule-view.component";
import { TrainingScheduleEditComponent } from "./schedules/training-schedule-edit/training-schedule-edit.component";
import { ScheduleFarmVisitComponent } from './farm-visits/schedule-farm-visit/schedule-farm-visit.component';
import { EditFarmVisitComponent } from './farm-visits/edit-farm-visit/edit-farm-visit.component';
import { FarmVisitListComponent } from './farm-visits/farm-visit-list/farm-visit-list.component';
import { ViewFarmVisitComponent } from './farm-visits/view-farm-visit/view-farm-visit.component';
import { EditNurseryComponent } from './seedlings/nurseries/edit-nursery/edit-nursery.component';
import { ViewNurseryComponent } from './seedlings/nurseries/view-nursery/view-nursery.component';
import { NurseryListComponent } from './seedlings/nurseries/nursery-list/nursery-list.component';
import { NurseryCreateComponent } from './seedlings/nurseries/nursery-create/nursery-create.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { GoogleChartsModule } from "angular-google-charts";
import { ReportsComponent } from './reports/reports.component';
import { SmsDashboardComponent } from './sms-dashboard/sms-dashboard.component';
import { ViewGapComponent } from './gaps/view-gap/view-gap.component';
import { ViewGroupComponent } from './groups/view-group/view-group.component';
@NgModule({
  declarations: [
    FarmerGroupListComponent,
    FarmerGroupCreateComponent,
    FarmerGroupEditComponent,
    GapListComponent,
    GapCreateComponent,
    GapEditComponent,
    GapDeleteModal,
    TrainingListComponent,
    TrainingCreateComponent,
    TrainingEditComponent,
    TrainingViewComponent,
    TrainingSchedulingCreateComponent,
    TrainingSchedulingListComponent,
    TrainingScheduleViewComponent,
    TrainingScheduleEditComponent,
    ScheduleFarmVisitComponent,
    EditFarmVisitComponent,
    ViewFarmVisitComponent,
    FarmVisitListComponent,
    ViewNurseryComponent,
    EditNurseryComponent,
    NurseryListComponent,
    NurseryCreateComponent,
    DashboardComponent,
    ReportsComponent,
    SmsDashboardComponent,
    ViewGapComponent,
    ViewGroupComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CommonModule,
    ExtensionServicesRoutingModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgbModule,
    NgxPaginationModule,
    GoogleMapsModule,
    GoogleChartsModule,
    NgMultiSelectDropDownModule,
  ],
  entryComponents: [GapDeleteModal],
})
export class ExtensionServicesModule {}
