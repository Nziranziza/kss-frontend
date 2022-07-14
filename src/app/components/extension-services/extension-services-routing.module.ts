import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from '../admin/admin/admin.component';
import { AdminGuard } from '../../core/guards/admin.guard';
import { FarmerGroupCreateComponent } from './groups/farmer-group-create/farmer-group-create.component';
import { FarmerGroupListComponent } from './groups/farmer-group-list/farmer-group-list.component';
import { GapListComponent } from './gaps/gap-list/gap-list.component';
import { GapCreateComponent } from './gaps/gap-create/gap-create.component';
import { GapEditComponent } from './gaps/gap-edit/gap-edit.component';

import { FarmerGroupEditComponent} from './groups/farmer-group-edit/farmer-group-edit.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'farmers/group/create',
        component: FarmerGroupCreateComponent,
      },
      {
        path: 'farmers/group/edit/:id',
        component: FarmerGroupEditComponent,
      },
      {
        path: 'farmers/group/list',
        component: FarmerGroupListComponent,
      },
      {
        path: 'gaps/list',
        component: GapListComponent,
      },
      {
        path: 'gaps/create',
        component: GapCreateComponent,
      },
      {
        path: 'gaps/edit/:id',
        component: GapEditComponent,
      }
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExtensionServicesRoutingModule {}
