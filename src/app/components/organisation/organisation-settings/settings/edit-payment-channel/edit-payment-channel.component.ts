import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HelperService} from '../../../../../core/helpers';
import {AuthenticationService, OrganisationService} from '../../../../../core/services';
import {isPlatformBrowser} from '@angular/common';
import {PaymentService} from '../../../../../core/services/payment.service';
import {ActivatedRoute} from '@angular/router';
import {BasicComponent} from '../../../../../core/library';

@Component({
  selector: 'app-edit-payment-channel',
  templateUrl: './edit-payment-channel.component.html',
  styleUrls: ['./edit-payment-channel.component.css']
})
export class EditPaymentChannelComponent extends BasicComponent implements OnInit {

  modal: NgbActiveModal;
  editChannelForm: FormGroup;
  organisationId: string;
  channels: any;
  banks: any;
  @Input() channel;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private helper: HelperService, private organisationService: OrganisationService) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.editChannelForm = this.formBuilder.group({
      channelId: [{value: '', disabled: true}, Validators.required],
      subscriptionNumber: ['', Validators.required],
      bankName: [{value: '', disabled: true}, Validators.required]
    });

    this.organisationId = this.authenticationService.getCurrentUser().info.org_id;
    this.getBanksList();
    this.getPaymentChannels();
    this.onChangePaymentChannel();
    this.editChannelForm.patchValue(this.channel);
  }

  onSubmit() {
    if (this.editChannelForm.valid) {
      let channel: {};
      channel = this.editChannelForm.value;
      channel['channelId'.toString()] = this.channel.channelId;
      channel['org_id'.toString()] = this.organisationId;
      channel['action'.toString()] = 'edit';
      this.organisationService.orgEditPaymentChannel(channel).subscribe(() => {
          this.setMessage('channel successfully updated!');
        },
        (err) => {
          this.setError(err.errors);
        });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.editChannelForm));
    }
  }

  onChangePaymentChannel() {
    this.editChannelForm.controls.channelId.valueChanges.subscribe((value) => {
      if (+value === 5) {
        this.editChannelForm.controls.bankName.enable();
      } else {
        this.editChannelForm.controls.bankName.disable();
      }
    });
  }

  getPaymentChannels() {
    this.paymentService.listChannelsConstants().subscribe((data) => {
      this.channels = Object.keys(data.content).map(key => {
        return {channel: key, _id: data.content[key]};
      });
      this.channels = this.helper.getOrgPossiblePaymentChannels(this.channels);
    });
  }

  getBanksList() {
    this.paymentService.listBanks().subscribe((data) => {
      this.banks = data.content;
    });
  }
}
