import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SeasonParametersComponent } from './season-parameters/season-parameters.component';
import { CreateSeasonComponent } from './season-parameters/create-season/create-season.component';
import { EditSeasonComponent } from './season-parameters/edit-season/edit-season.component';

@NgModule({
  declarations: [SeasonParametersComponent, CreateSeasonComponent, EditSeasonComponent],
  imports: [
    CommonModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule { }
