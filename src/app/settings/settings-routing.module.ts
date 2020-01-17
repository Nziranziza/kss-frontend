import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {SeasonParametersComponent} from './season-parameters/season-parameters.component';
import {CoffeeTypeComponent} from './coffee-type/coffee-type.component';
import {CoffeeTypeCreateComponent} from './coffee-type/coffee-type-create/coffee-type-create.component';
import {AdminGuard} from '../core/services/guards/admin.guard';
import {DistributionParametersComponent} from './distribution-parameters/distribution-parameters.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'season-parameters',
        component: SeasonParametersComponent
      },
      {
        path: 'coffee-type/create',
        component: CoffeeTypeCreateComponent
      },
      {
        path: 'coffee-type/list',
        component: CoffeeTypeComponent
      },
      {
        path: 'distribution-parameters',
        component: DistributionParametersComponent
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule {
}
