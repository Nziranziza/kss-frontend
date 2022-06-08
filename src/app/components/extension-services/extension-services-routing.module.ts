import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from '../admin/admin/admin.component';
import { AdminGuard } from '../../core/guards/admin.guard';
import { FarmerGroupCreateComponent } from './groups/farmer-group-create/farmer-group-create.component';
import { FarmerGroupListComponent } from './groups/farmer-group-list/farmer-group-list.component';
import { GapListComponent } from './gaps/gap-list/gap-list.component';
import { GapCreateComponent } from './gaps/gap-create/gap-create.component';
import { GapEditComponent } from './gaps/gap-edit/gap-edit.component';
import {TrainingCreateComponent} from './training/training-create/training-create.component';
import {TrainingListComponent} from './training/training-list/training-list.component';

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
      },
      { 
        path: 'training/create',
        component: TrainingCreateComponent
      },
      {
        path: 'training/list',
        component: TrainingListComponent
      }
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExtensionServicesRoutingModule {}
