import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BasicComponent} from '../../../core/library';
import {HelperService} from '../../../core/helpers';
import {isPlatformBrowser} from '@angular/common';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthenticationService, CherrySupplyService, OrganisationService} from '../../../core/services';
import {PaymentService} from '../../../core/services/payment.service';

@Component({
  selector: 'app-pay-single-farmer',
  templateUrl: './pay-single-farmer.component.html',
  styleUrls: ['./pay-single-farmer.component.css']
})
export class PaySingleFarmerComponent extends BasicComponent implements OnInit {

  cashPaymentForm: FormGroup;
  ePaymentForm: FormGroup;
  modal: NgbActiveModal;
  @Input() paymentData;
  channels: any;
  payerAccount: any;
  orgPaymentChannels: any;
  organisationId: string;
  paymentRequest: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder,
    private cherrySupplyService: CherrySupplyService,
    private organisationService: OrganisationService,
    private authenticationService: AuthenticationService,
    private paymentService: PaymentService,
    private helper: HelperService) {

    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.cashPaymentForm = this.formBuilder.group({
      amount: ['', Validators.required]
    });
    this.organisationId = this.authenticationService.getCurrentUser().info.org_id;
    this.ePaymentForm = this.formBuilder.group({
      amount: ['', Validators.required],
      paymentChannel: ['', Validators.required]
    });
    console.log(this.paymentData);
    this.cashPaymentForm.controls.amount.setValue(this.paymentData.paidAmount);
    this.ePaymentForm.controls.amount.setValue(this.paymentData.paidAmount);
    this.getOrgPaymentChannels();
    this.onChangePaymentChannel();
  }

  onSubmitCashPayment() {
    if (this.cashPaymentForm.valid) {
      this.cherrySupplyService.paySupplies(this.paymentData)
        .subscribe(() => {
            this.setMessage('Payment successfully recorded!');
          },
          (err) => {
            this.setError(err.errors);
          });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.cashPaymentForm));
    }
  }

  onChangePaymentChannel() {
    this.ePaymentForm.get('paymentChannel'.toString()).valueChanges.subscribe(
      (value) => {
        this.payerAccount = this.orgPaymentChannels.find(channel => channel.channelId === +value);
      });
  }

  getOrgPaymentChannels() {
    this.organisationService.orgPaymentChannels(this.organisationId).subscribe((data) => {
      this.orgPaymentChannels = data.content;
    });
  }

  onSubmitEPayment() {
    if (this.payerAccount) {
      this.paymentRequest = {
        org_id: this.organisationId,
        userId: this.paymentData.userId,
        paymentChannel: this.payerAccount.channelId,
        payerSubscriptionNumber: this.payerAccount.subscriptionNumber,
        totalAmountPaid: this.paymentData.paidAmount,
        beneficiaries: [
          {
            regNumber: this.paymentData.regNumber,
            subscriptionNumber: this.paymentData.subscriptionNumber,
            amount: this.paymentData.paidAmount,
            deliveries: this.paymentData.deliveries
          }
        ]
      };
      this.paymentService.bulkPayment(this.paymentRequest).subscribe(() => {
          this.setMessage('Payment successfully initiated!');
        },
        (err) => {
          this.setError(err.errors);
        });
    } else {
      this.setError(['Please select the paying account!']);
      return;
    }
  }
}
