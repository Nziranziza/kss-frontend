import {Component, Inject, Injector, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HelperService} from '../../../core/helpers';
import {AuthenticationService, OrganisationService} from '../../../core/services';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-edit-payment-channel',
  templateUrl: './edit-payment-channel.component.html',
  styleUrls: ['./edit-payment-channel.component.css']
})
export class EditPaymentChannelComponent implements OnInit {

  modal: NgbActiveModal;
  editChannelForm: FormGroup;
  organisationId: string;
  channel: any;
  errors: string [];
  message: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private helper: HelperService, private organisationService: OrganisationService) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.editChannelForm = this.formBuilder.group({
      channelId: ['', Validators.required],
      subscriptionNumber: ['', Validators.required],
      bankName: [{value: '', disabled: true}, Validators.required]
    });
  }

  onSubmit() {
    if (this.editChannelForm.valid) {
      const channel = this.editChannelForm.value;
      channel['org_id'.toString()] = this.organisationId;
      this.organisationService.orgEditPaymentChannel(channel).subscribe(() => {
          this.message = 'channel successfully updated!';
          this.modal.dismiss();
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editChannelForm);
    }
  }

}
