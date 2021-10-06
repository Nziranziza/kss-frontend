import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {AdminGuard} from '../core/services/guards/admin.guard';
import {DmParchmentListDeliveriesComponent} from './dm-parchment-list-deliveries/dm-parchment-list-deliveries.component';
import {PrepareGreenCoffeeComponent} from './prepare-green-coffee/prepare-green-coffee.component';
import {ListGreenCoffeeComponent} from './list-green-coffee/list-green-coffee.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'drymill/parchment/list',
        component: DmParchmentListDeliveriesComponent
      },
      {
        path: 'drymill/prepare/green_coffee',
        component: PrepareGreenCoffeeComponent
      },
      {
        path: 'drymill/green_coffee/mixtures',
        component: ListGreenCoffeeComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DryProcessingRoutingModule {
}
