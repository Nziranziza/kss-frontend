import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {BasicComponent} from '../../../../core/library';
import {PaymentProcessingService} from '../../../../core/services/payment-processing.service';
import {AuthenticationService, OrganisationService} from '../../../../core/services';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {PaymentService} from '../../../../core/services/payment.service';
import {HelperService} from '../../../../core/helpers';

@Component({
  selector: 'app-confirm-payment',
  templateUrl: './confirm-payment.component.html',
  styleUrls: ['./confirm-payment.component.css']
})
export class ConfirmPaymentComponent extends BasicComponent implements OnInit {

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              private organisationService: OrganisationService,
              private formBuilder: FormBuilder,
              private datePipe: DatePipe,
              private paymentService: PaymentService,
              private helper: HelperService,
              private paymentProcessingService: PaymentProcessingService) {
    super();
  }

  paymentSummary: any;
  organisationId: string;
  orgPaymentChannels: any;
  selectPayerForm: FormGroup;
  org: any;
  today: any;
  payerAccount: any;
  paymentRequest: any;
  paymentList: any;

  ngOnInit() {
    this.paymentSummary = this.paymentProcessingService.getSelectionStatistics();
    this.organisationId = this.authenticationService.getCurrentUser().info.org_id;
    this.org = this.authenticationService.getCurrentUser().orgInfo;
    this.selectPayerForm = this.formBuilder.group({
      paymentChannel: ['none', Validators.required]
    });
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.getOrgPaymentChannels();
    this.onChangePaymentChannel();
    this.paymentList = this.paymentProcessingService.getPaymentList();
  }

  onPay() {
    this.paymentRequest = {...this.payerAccount, ...this.paymentList};
    if (this.payerAccount) {
      this.paymentRequest = {...{paymentChannel: this.payerAccount.channelId,
          payerSubscriptionNumber: this.payerAccount.subscriptionNumber}, ...this.paymentList};
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

  onChangePaymentChannel() {
    this.selectPayerForm.get('paymentChannel'.toString()).valueChanges.subscribe(
      (value) => {
        this.payerAccount = this.orgPaymentChannels.find(channel => channel.channelId === +value);
      });
  }

  getOrgPaymentChannels() {
    this.organisationService.orgPaymentChannels(this.organisationId).subscribe((data) => {
      this.orgPaymentChannels = data.content;
    });
  }

  onPrevious() {
    this.router.navigateByUrl('admin/pay-farmers/preview-deliveries');
  }
}
