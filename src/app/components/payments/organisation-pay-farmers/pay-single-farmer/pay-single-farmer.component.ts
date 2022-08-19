import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BasicComponent} from '../../../../core/library';
import {HelperService} from '../../../../core/helpers';
import {isPlatformBrowser} from '@angular/common';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthenticationService, CherrySupplyService, OrganisationService, UserService} from '../../../../core/services';
import {PaymentService} from '../../../../core/services/payment.service';

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
  @Input() farmerUserId;
  channels: any;
  payerAccount: any;
  orgPaymentChannels: any;
  farmerPaymentChannels: any;
  supplier: any;
  organisationId: string;
  paymentRequest: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder,
    private cherrySupplyService: CherrySupplyService,
    private organisationService: OrganisationService,
    private userService: UserService,
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
      paymentChannel: ['', Validators.required],
      receivingChannel: ['', Validators.required],
    });
    this.userService.get(this.farmerUserId).subscribe((user) => {
      this.supplier = user.content;
    });
    this.cashPaymentForm.controls.amount.setValue(this.paymentData.paidAmount);
    this.ePaymentForm.controls.amount.setValue(this.paymentData.paidAmount);
    this.getOrgPaymentChannels();
    this.onChangePaymentChannel();
  }

  onSubmitCashPayment() {
    if (this.cashPaymentForm.valid) {
      const beneficiary: any = {
        foreName: this.supplier.groupName ? this.supplier.groupName : this.supplier.foreName,
        userId: this.supplier._id,
        surname: this.supplier.surname ? this.supplier.surname : '',
        regNumber: this.paymentData.regNumber,
        amount: this.paymentData.paidAmount,
        deliveries: this.paymentData.deliveryIds,
      };
      this.helper.cleanObject(beneficiary);
      this.paymentRequest = {
        org_id: this.organisationId,
        userId: this.paymentData.userId,
        paymentChannel: 4,
        totalAmountPaid: this.paymentData.paidAmount,
        beneficiaries: [
          beneficiary
        ]
      };
      this.paymentService.payCherries( this.paymentRequest)
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
        this.farmerPaymentChannels = this.helper.getFarmerPossibleReceivingPaymentChannels(+value, this.supplier.paymentChannels);
        this.ePaymentForm.controls.receivingChannel.reset();
      });
  }

  getOrgPaymentChannels() {
    this.organisationService.orgPaymentChannels(this.organisationId).subscribe((data) => {
      this.orgPaymentChannels = data.content;
    });
  }

  getSubscriptionNumber(channelId: number) {
    return this.farmerPaymentChannels.find(element => element.paymentChannel === channelId).subscriptionCode;
  }

  onSubmitEPayment() {
    if (this.payerAccount) {
      const beneficiary: any = {
        foreName: this.supplier.type === 2 ? this.supplier.groupName : this.supplier.foreName,
        regNumber: this.paymentData.regNumber,
        subscriptionNumber: this.getSubscriptionNumber(+this.ePaymentForm.controls.receivingChannel.value),
        amount: this.paymentData.paidAmount,
        userId: this.supplier._id,
        deliveries: this.paymentData.deliveryIds,
      };
      if (this.supplier.type === 1) {
        beneficiary.surname = this.supplier.surname;
      }
      this.helper.cleanObject(beneficiary);
      this.paymentRequest = {
        org_id: this.organisationId,
        userId: this.paymentData.userId,
        paymentChannel: this.payerAccount.channelId,
        payerSubscriptionNumber: this.payerAccount.subscriptionNumber,
        totalAmountPaid: this.paymentData.paidAmount,
        beneficiaries: [
          beneficiary
        ]
      };
      if (this.payerAccount.channelId === 5) {
        this.paymentRequest['bankName'.toString()] = this.payerAccount.bankName;
      }
      this.paymentService.payCherries(this.paymentRequest).subscribe(() => {
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
