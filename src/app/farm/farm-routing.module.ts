import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from '../admin/admin/admin.component';
import {AdminGuard} from '../core/services/guards/admin.guard';
import {TreeVarietiesListComponent} from './tree-variety/tree-varieties-list/tree-varieties-list.component';
import {TreeVarietyCreateComponent} from './tree-variety/tree-variety-create/tree-variety-create.component';
import {TreeVarietyEditComponent} from './tree-variety/tree-variety-edit/tree-variety-edit.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'farm/tree-varieties/list',
        component: TreeVarietiesListComponent
      },
      {
        path: 'farm/tree-varieties/create',
        component: TreeVarietyCreateComponent,
      },
      {
        path: 'farm/tree-varieties/edit/:id',
        component: TreeVarietyEditComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FarmRoutingModule {
}
