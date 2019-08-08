import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminComponent} from '../../admin/admin/admin.component';
import {SiteCreateComponent} from './site-create/site-create.component';
import {SiteListComponent} from './site-list/site-list.component';
import {SiteEditComponent} from './site-edit/site-edit.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'sites',
        component: SiteListComponent
      },
      {
        path: 'sites/create',
        component: SiteCreateComponent
      },
      {
        path: 'sites/edit/:id',
        component: SiteEditComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SitesRoutingModule {
}
