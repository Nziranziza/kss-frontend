import { IntegrationsService } from 'src/app/core/services/integrations.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, Inject, Injector, Input, OnInit, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-app-form',
  templateUrl: './app-form.component.html',
  styleUrls: ['./app-form.component.css']
})
export class AppFormComponent implements OnInit {

  modal: NgbActiveModal
  appForm: UntypedFormGroup
  errors: string;
  @Input() reload: any = () => {};
  @Input() app: any = {};
  saveLoading = false;
  regenerateLoading = false;
  appKey: string;
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
    private formBuilder: UntypedFormBuilder,
    private integrationService: IntegrationsService
  ) { 
    if(isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal)
    }
  }

  ngOnInit(): void {
    this.appForm = this.formBuilder.group({
      name: [this.app?.name || '', Validators.required],
      description: [this.app?.description || '']
    });
  }

  onSubmit() {
    if(!this.appForm.invalid) {
      this.saveLoading = true;
      if(this.app?.id) {
        this.integrationService.updateIntegration(this.app.id, this.appForm.value).subscribe(() => {
          this.reload();
          this.saveLoading = false;
        })
      } else {
        this.integrationService.createIntegration(this.appForm.value).subscribe(({ data }) => {
          this.reload();
          this.app = data;
          this.appKey = data?.appKey;
          this.saveLoading = false
        })
      }
    } else {
      this.errors = 'Name is required'
    }
  }

  regenerateAppKey() {
    this.integrationService.regenerateAppKey(this.app.id).subscribe(({ data }) => {
      this.appKey = data.key
    })
  }

}
