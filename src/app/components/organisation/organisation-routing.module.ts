import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { OrganisationListComponent } from "./organisation-list/organisation-list.component";
import { AdminComponent } from "../admin/admin/admin.component";
import { OrganisationCreateComponent } from "./organisation-create/organisation-create.component";
import { OrganisationEditComponent } from "./organisation-edit/organisation-edit.component";
import { OrganisationFarmersComponent } from "./organisation-farmers/organisation-farmers.component";
import { OrganisationPendingFarmersComponent } from "./organisation-pending-farmers/organisation-pending-farmers.component";
import { AdminGuard } from "../../core/guards/admin.guard";
import { CoveredAreaResolverService } from "../../core/resolvers/covered-area-resolver.service";
import { AuthorisationGuardService } from "../../core/services";
import { OrganisationSuppliersComponent } from "./organisation-suppliers/organisation-suppliers.component";
import { OrganisationSettingsComponent } from "./organisation-settings/settings/settings/organisation-settings.component";
import { OrganisationDetailsComponent } from "./organisation-details/organisation-details.component";
import { DashboardComponent } from "../extension-services/dashboard/dashboard.component";
import { UserListComponent } from "../user/user-list/user-list.component";
import { ParchmentListComponent } from "../wet-processing/parchment/parchment-list/parchment-list.component";

const routes: Routes = [
  {
    path: "admin",
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: "organisations",
        component: OrganisationListComponent,
        data: { permissions: [0, 4, 6, 8, 5, 1, 11] },
        canActivate: [AuthorisationGuardService],
      },
      {
        path: "organisations/create",
        component: OrganisationCreateComponent,
      },
      {
        path: "organisations/edit/:id",
        component: OrganisationEditComponent,
      },
      {
        path: "cws-farmers/:organisationId",
        component: OrganisationFarmersComponent,
        resolve: { orgCoveredAreaData: CoveredAreaResolverService },
      },
      {
        path: "cws-suppliers/:organisationId",
        component: OrganisationSuppliersComponent,
        resolve: { orgCoveredAreaData: CoveredAreaResolverService },
      },
      {
        path: "cws-pending-farmers/:organisationId",
        component: OrganisationPendingFarmersComponent,
      },
      {
        path: "settings/organisation/:organisationId",
        component: OrganisationSettingsComponent,
      },
      {
        path: "organisations/:organisationId/farmer",
        component: OrganisationFarmersComponent,
        resolve: { orgCoveredAreaData: CoveredAreaResolverService },
      },
      {
        path: "organisations/details/:organisationId",
        component: OrganisationDetailsComponent,
        resolve: { orgCoveredArea: CoveredAreaResolverService },
        children: [
          {
            path: ":organisationId/dashboard",
            component: DashboardComponent,
            resolve: { orgCoveredAreaData: CoveredAreaResolverService },
          },
          {
            path: ":organisationId/farmers",
            component: OrganisationFarmersComponent,
            resolve: { orgCoveredAreaData: CoveredAreaResolverService },
          },
          {
            path: ":organisationId/suppliers",
            component: OrganisationSuppliersComponent,
          },
          {
            path: ":organisationId/cherries",
            component: ParchmentListComponent,
          },
          { path: ":organisationId/users", component: UserListComponent },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganisationRoutingModule {}
