import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {BasicComponent} from '../../../../core/library';
import {PaymentProcessingService} from '../../../../core/services/payment-processing.service';
import {AuthenticationService, MessageService, OrganisationService} from '../../../../core/services';
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
              private messageService: MessageService,
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
  isCashPaymentMode: boolean;
  paymentList: any;
  isLoading: boolean = false;

  ngOnInit() {
    this.paymentSummary = this.paymentProcessingService.getSelectionStatistics();
    this.organisationId = this.authenticationService.getCurrentUser().info.org_id;
    this.org = this.authenticationService.getCurrentUser().orgInfo;
    this.selectPayerForm = this.formBuilder.group({
      paymentChannel: ['none', Validators.required]
    });
    this.isCashPaymentMode = (+this.paymentProcessingService.getSelectionFilter().paymentChannel === 4);
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.getOrgPaymentChannels();
    this.onChangePaymentChannel();
    this.paymentList = this.paymentProcessingService.getPaymentList();
  }

  onPay() {
    this.isLoading = true;
    this.paymentRequest = {...this.payerAccount, ...this.paymentList};
    /* if is not a cash payment mode */
    if (!this.isCashPaymentMode) {
      if (this.payerAccount) {
        const payer: any = {
          paymentChannel: this.payerAccount.channelId,
          payerSubscriptionNumber: this.payerAccount.subscriptionNumber
        };
        if (this.payerAccount.channelId === 5) {
          payer['bankName'.toString()] = this.payerAccount.bankName;
        }
        this.paymentRequest = {...payer, ...this.paymentList};
        this.paymentService.payCherries(this.paymentRequest).subscribe(() => {
            this.setMessage('Payment successfully initiated!');
            this.isLoading = false;
          },
          (err) => {
            this.setError(err.errors);
            this.isLoading = false;
          });
      } else {
        this.isLoading = false;
        this.setError(['Please select the paying account!']);
        return;
      }
    } else {
      const payer: any = {
        paymentChannel: +this.paymentProcessingService.getSelectionFilter().paymentChannel
      };
      this.paymentRequest = {...payer, ...this.paymentList};
      this.paymentService.payCherries(this.paymentRequest).subscribe(() => {
          this.setMessage('Payment successfully recorded!');
          this.isLoading = false;
        },
        (err) => {
          this.setError(err.errors);
          this.isLoading = false;
        });
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
      const selectedChannel = this.paymentProcessingService.getSelectionFilter().paymentChannel;
      this.orgPaymentChannels = this.helper.getOrgPossibleSourcePaymentChannels(selectedChannel, this.orgPaymentChannels);
    });
  }

  onPrevious() {
    this.router.navigateByUrl('admin/pay-farmers/preview-deliveries');
  }
}
