import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {AdminGuard} from '../core/services/guards/admin.guard';
import {SwListGreenCoffeesComponent} from './sw-list-green-coffees/sw-list-green-coffees.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'sorting/green_coffee/list',
        component: SwListGreenCoffeesComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SortingRoutingModule { }
