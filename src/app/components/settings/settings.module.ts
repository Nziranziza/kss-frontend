import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsRoutingModule } from './settings-routing.module';
import { SeasonParametersComponent } from './season-parameters/season-parameters.component';
import { CreateSeasonComponent } from './season-parameters/create-season/create-season.component';
import { EditSeasonComponent } from './season-parameters/edit-season/edit-season.component';
import { SharedModule } from '../../shared';
import { CoffeeTypeComponent } from './coffee-type/coffee-type.component';
import { CoffeeTypeCreateComponent } from './coffee-type/coffee-type-create/coffee-type-create.component';
import { CoffeeTypeEditComponent } from './coffee-type/coffee-type-edit/coffee-type-edit.component';
import { DeleteTypeModal } from './coffee-type/coffee-type-delete-modal/coffee-type-delete-modal-component';
import { DistributionParametersComponent } from './distribution-parameters/distribution-parameters.component';
import { EditInputComponent } from './distribution-parameters/edit-input/edit-input.component';
import { EditSupplierComponent } from './distribution-parameters/edit-supplier/edit-supplier.component';
import { ChannelComponent } from './payment-channel/channel-create/channel.component';
import { ChannelListComponent } from './payment-channel/channel-list/channel-list.component';
import { ChannelEditComponent } from './payment-channel/channel-edit/channel-edit.component';
import { IntegrationsComponent } from './integrations/integrations.component';
import { AppFormComponent } from './integrations/app-form/app-form.component';

@NgModule({
    declarations: [
        SeasonParametersComponent,
        CreateSeasonComponent,
        EditSeasonComponent,
        ChannelComponent,
        CoffeeTypeComponent,
        CoffeeTypeCreateComponent,
        CoffeeTypeEditComponent,
        DeleteTypeModal,
        DistributionParametersComponent,
        EditInputComponent,
        EditSupplierComponent,
        ChannelListComponent,
        ChannelEditComponent,
        IntegrationsComponent,
        AppFormComponent
    ],
    imports: [CommonModule, SettingsRoutingModule, SharedModule]
})
export class SettingsModule {}
