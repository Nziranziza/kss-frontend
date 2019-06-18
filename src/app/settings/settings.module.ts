import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsRoutingModule} from './settings-routing.module';
import {SeasonParametersComponent} from './season-parameters/season-parameters.component';
import {CreateSeasonComponent} from './season-parameters/create-season/create-season.component';
import {EditSeasonComponent} from './season-parameters/edit-season/edit-season.component';
import {SharedModule} from '../shared';
import { CoffeeTypeComponent } from './coffee-type/coffee-type.component';
import { CoffeeTypeCreateComponent } from './coffee-type/coffee-type-create/coffee-type-create.component';

@NgModule({
  declarations: [SeasonParametersComponent, CreateSeasonComponent, EditSeasonComponent, CoffeeTypeComponent, CoffeeTypeCreateComponent],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SharedModule
  ],
  entryComponents: [CreateSeasonComponent, EditSeasonComponent]
})
export class SettingsModule { }
