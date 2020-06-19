import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BasicComponent} from '../../core/library';
import {PaymentService} from '../../core/services/payment.service';
import {HelperService} from '../../core/helpers';
import {OrganisationService} from '../../core/services';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-organisation-settings',
  templateUrl: './organisation-settings.component.html',
  styleUrls: ['./organisation-settings.component.css']
})
export class OrganisationSettingsComponent extends BasicComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private paymentService: PaymentService,
              private route: ActivatedRoute,
              private helper: HelperService, private organisationService: OrganisationService) {
    super();
  }

  addPaymentChannelForm: FormGroup;
  paymentChannels: any;
  channels: any;
  organisationId: string;
  orgPaymentChannels: any;
  banks: any;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
    });
    this.addPaymentChannelForm = this.formBuilder.group({
      paymentChannels: new FormArray([])
    });
    this.getBanksList();
    this.getPaymentChannels();
    this.addPaymentChannel();
    this.getOrgPaymentChannels();
  }

  onSubmitPaymentChannel() {
    if (this.addPaymentChannelForm.valid) {
      const paymentChannel = this.addPaymentChannelForm.value;
      paymentChannel['org_id'.toString()] = this.organisationId;
      paymentChannel['channels'.toString()] = paymentChannel.paymentChannels;
      delete paymentChannel.paymentChannels;
      paymentChannel.channels.map((channel) => {
        channel.channelId = +channel.channelId;
      });
      this.organisationService.orgAddPaymentChannels(paymentChannel)
        .subscribe((data) => {
            this.setMessage(data.message);
            this.getOrgPaymentChannels();
          },
          (err) => {
            this.setError(err.errors);
          });
    } else {
      this.setError(['missing required data']);
    }
  }

  get formPaymentChannel() {
    return this.addPaymentChannelForm.controls.paymentChannels as FormArray;
  }

  onChangePaymentChannel(index: number) {
    const value = this.formPaymentChannel.value[index];
    this.formPaymentChannel.value.forEach((el, i) => {
      if ((value.channelId === el.channelId) && (this.formPaymentChannel.value.length > 1) && (i !== index)) {
        this.removePaymentChannel(index);
      }
    });
    if (+value.channelId === 5) {
      this.getPaymentChannelFormGroup(index).controls.bankName.enable();
    } else {
      this.getPaymentChannelFormGroup(index).controls.bankName.disable();
    }
  }

  addPaymentChannel() {
    (this.addPaymentChannelForm.controls.paymentChannels as FormArray).push(this.createPaymentChannel());
  }

  removePaymentChannel(index: number) {
    (this.addPaymentChannelForm.controls.paymentChannels as FormArray).removeAt(index);
  }

  getPaymentChannelFormGroup(index): FormGroup {
    this.paymentChannels = this.addPaymentChannelForm.controls.paymentChannels as FormArray;
    return this.paymentChannels.controls[index] as FormGroup;
  }

  createPaymentChannel(): FormGroup {
    return this.formBuilder.group({
      channelId: ['', Validators.required],
      subscriptionNumber: ['', Validators.required],
      bankName: [{value: '', disabled: true}, Validators.required]
    });
  }

  getPaymentChannels() {
    this.paymentService.listChannelsConstants().subscribe((data) => {
      this.channels = Object.keys(data.content).map(key => {
        return {channel: key, _id: data.content[key]};
      });
    });
  }

  getOrgPaymentChannels() {
    this.organisationService.orgPaymentChannels(this.organisationId).subscribe((data) => {
      this.orgPaymentChannels = data.content;
    });
  }

  getBanksList() {
    this.paymentService.listBanks().subscribe((data) => {
      this.banks = data.content;
    });
  }
}
