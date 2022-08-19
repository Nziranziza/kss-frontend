import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../../admin/admin/admin.component';
import {NgModule} from '@angular/core';
import {WarehouseEntriesComponent} from './warehouse-entries/warehouse-entries.component';
import {WarehouseDispatchComponent} from './warehouse-dispatch/warehouse-dispatch.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'warehouse/entries',
        component: WarehouseEntriesComponent
      },
      {
        path: 'warehouse/dispatches',
        component: WarehouseDispatchComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WarehouseRoutingModule {
}
