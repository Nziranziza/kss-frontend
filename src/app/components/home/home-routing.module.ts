import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {PrivacyPoliceComponent} from './privacy-police/privacy-police.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {
    path: 'privacy/policy',
    component: PrivacyPoliceComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {
}
