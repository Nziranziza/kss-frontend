import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AdminComponent } from "../admin/admin/admin.component";
import { AdminGuard } from "../../core/guards/admin.guard";
import { FarmerGroupCreateComponent } from "./groups/farmer-group-create/farmer-group-create.component";
import { FarmerGroupListComponent } from "./groups/farmer-group-list/farmer-group-list.component";
import { GapListComponent } from "./gaps/gap-list/gap-list.component";
import { GapCreateComponent } from "./gaps/gap-create/gap-create.component";
import { GapEditComponent } from "./gaps/gap-edit/gap-edit.component";
import { TrainingCreateComponent } from "./trainings/training-create/training-create.component";
import { TrainingListComponent } from "./trainings/training-list/training-list.component";
import { TrainingSchedulingCreateComponent } from "./schedules/training-scheduling-create/training-scheduling-create.component";
import { TrainingSchedulingListComponent } from "./schedules/training-scheduling-list/training-scheduling-list.component";
import { TrainingEditComponent } from "./trainings/training-edit/training-edit.component";
import { ScheduleFarmVisitComponent } from "./farm-visits/schedule-farm-visit/schedule-farm-visit.component";
import { EditFarmVisitComponent } from "./farm-visits/edit-farm-visit/edit-farm-visit.component";
import { DeleteFarmVisitComponent } from "./farm-visits/delete-farm-visit/delete-farm-visit.component";
import { FarmVisitListComponent } from "./farm-visits/farm-visit-list/farm-visit-list.component";
import { ViewFarmVisitComponent } from "./farm-visits/view-farm-visit/view-farm-visit.component";
import { TrainingScheduleViewComponent } from "./schedules/training-schedule-view/training-schedule-view.component";
import { TrainingScheduleEditComponent } from "./schedules/training-schedule-edit/training-schedule-edit.component";
import { TrainingViewComponent } from "./trainings/training-view/training-view.component";

const routes: Routes = [
  {
    path: "admin",
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: "farmers/group/create",
        component: FarmerGroupCreateComponent,
      },
      {
        path: "farmers/group/list",
        component: FarmerGroupListComponent,
      },
      {
        path: "gaps/list",
        component: GapListComponent,
      },
      {
        path: "gaps/create",
        component: GapCreateComponent,
      },
      {
        path: "gaps/edit/:id",
        component: GapEditComponent,
      },
      {
        path: "training/create",
        component: TrainingCreateComponent,
      },
      {
        path: "training/list",
        component: TrainingListComponent,
      },
      {
        path: "training/edit/:id",
        component: TrainingEditComponent,
      },
      {
        path: "training/details/:id",
        component: TrainingViewComponent,
      },
      {
        path: "training/schedule/create",
        component: TrainingSchedulingCreateComponent,
      },
      {
        path: "training/schedule/list",
        component: TrainingSchedulingListComponent,
      },
      {
        path: "training/schedule/edit",
        component: TrainingScheduleEditComponent,
      },
      {
        path: "training/schedule/view",
        component: TrainingScheduleViewComponent,
      },
      {
        path: "farm/visit/create",
        component: ScheduleFarmVisitComponent,
      },
      {
        path: "farm/visit/list",
        component: FarmVisitListComponent,
      },
      {
        path: "farm/visit/edit/:id",
        component: EditFarmVisitComponent,
      },
      {
        path: "farm/visit/details/:id",
        component: ViewFarmVisitComponent,
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExtensionServicesRoutingModule {}
