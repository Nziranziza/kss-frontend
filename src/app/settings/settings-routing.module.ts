import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminComponent } from "../admin/admin/admin.component";
import { SeasonParametersComponent } from "./season-parameters/season-parameters.component";
import { CoffeeTypeComponent } from "./coffee-type/coffee-type.component";
import { CoffeeTypeCreateComponent } from "./coffee-type/coffee-type-create/coffee-type-create.component";
import { CoffeeTypeEditComponent } from "./coffee-type/coffee-type-edit/coffee-type-edit.component";
import { AdminGuard } from "../core/services/guards/admin.guard";
import { DistributionParametersComponent } from "./distribution-parameters/distribution-parameters.component";
import { ChannelComponent } from "./payment-channel/channel-create/channel.component";
import { ChannelListComponent } from "./payment-channel/channel-list/channel-list.component";
import { ChannelEditComponent } from "./payment-channel/channel-edit/channel-edit.component";

const routes: Routes = [
  {
    path: "admin",
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: "season-parameters",
        component: SeasonParametersComponent,
      },
      {
        path: "coffee-type/create",
        component: CoffeeTypeCreateComponent,
      },
      {
        path: "coffee-type/edit/:id",
        component: CoffeeTypeEditComponent,
      },
      {
        path: "payment-channel/create",
        component: ChannelComponent,
      },
      {
        path: "payment-channel/list",
        component: ChannelListComponent,
      },
      {
        path: "payment-channel/edit/:id",
        component: ChannelEditComponent,
      },
      {
        path: "coffee-type/list",
        component: CoffeeTypeComponent,
      },
      {
        path: "distribution-parameters",
        component: DistributionParametersComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
