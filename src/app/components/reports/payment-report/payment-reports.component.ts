import {Component, OnInit} from '@angular/core';
import {BasicComponent} from '../../../core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {HelperService} from '../../../core';
import {AuthenticationService, AuthorisationService} from '../../../core';
import {PaymentService} from '../../../core/services/payment.service';
import {DatePipe} from '@angular/common';
import {ChartType} from 'angular-google-charts';

@Component({
  selector: 'app-payment-reports',
  templateUrl: './payment-reports.component.html',
  styleUrls: ['./payment-reports.component.css']
})
export class PaymentReportsComponent extends BasicComponent implements OnInit {

  constructor(private formBuilder: UntypedFormBuilder, private helperService: HelperService,
              private authorisationService: AuthorisationService,
              private paymentService: PaymentService,
              private datePipe: DatePipe,
              private authenticationService: AuthenticationService) {
    super();
  }

  filterForm: UntypedFormGroup;
  seasonStartingTime: string;
  payment = {
    airtel: {amount: 0, transactions: 0},
    mtn: {amount: 0, transactions: 0},
    ikofi: {amount: 0, transactions: 0},
    cash: {amount: 0, transactions: 0}
  };
  paymentPartitionsGraph = {
    title: 'Payment Partitions',
    type: ChartType.PieChart,
    data: [
      ['Ikofi', 0],
      ['Cash', 0],
      ['MTN', 0],
      ['Airtel', 0]
    ],
    columnNames: ['Channel', 'Percentage'],
    options: {
      pieHole: 0.5,
      colors: ['#0f92c3', '#00a65a', '#f39c12', '#dd4b39']
    },
    width: 550,
    height: 400
  };
  channelsGraph = {
    title: 'Payment Channels',
    type: ChartType.ColumnChart,
    data: [
      ['Ikofi', 0, 0, 0, 0],
      ['Cash', 0, 0, 0, 0],
      ['MTN', 0, 0, 0, 0],
      ['Airtel', 0, 0, 0, 0]
    ],
    columnNames: ['Channel', 'Pending', 'Failed', 'Success', 'Rejected'],
    options: {
      legend: {position: 'bottom', maxLines: 3},
      colors: ['#0f92c3', '#f39c12', '#00a65a', '#dd4b39'],
      chartArea: {
        left: '10%',
        top: '10%',
        height: 'auto',
        width: '100%'
      },
    },
    width: 550,
    height: 400
  };

  ngOnInit() {
    this.seasonStartingTime = this.authenticationService.getCurrentSeason().created_at;
    this.filterForm = this.formBuilder.group({
      date: this.formBuilder.group({
        from: [this.datePipe.transform(this.seasonStartingTime,
          'yyyy-MM-dd', 'GMT+2'), Validators.required],
        to: [this.datePipe.transform(new Date(), 'yyyy-MM-dd', 'GMT+2'), Validators.required],
      })
    });
    this.onSubmit();
  }

  onSubmit() {
    if (!this.filterForm.invalid) {
      this.loading = true;
      const filter = this.filterForm.value;
      const pieChartData = [];
      const columnChartData = [];
      if (this.authorisationService.isCWSAdmin()) {
        filter['org_id'.toString()] = this.authenticationService.getCurrentUser().info.org_id;
      }
      this.paymentService.getPaymentsReport(filter).subscribe((data) => {
        data.content.map((channel) => {
          pieChartData.push([channel.channelName, channel.numberOfTransaction]);
          columnChartData.push([channel.channelName, channel.status.pending,
            channel.status.failed, channel.status.success, channel.status.rejected]);
          if (channel.channelName === 'AIRTEL_MONEY') {
            this.payment.airtel.amount = channel.totalAmountPaid;
            this.payment.airtel.transactions = channel.numberOfTransaction;
          }
          if (channel.channelName === 'MTN_MOBILE_MONEY') {
            this.payment.mtn.amount = channel.totalAmountPaid;
            this.payment.mtn.transactions = channel.numberOfTransaction;
          }
          if (channel.channelName === 'IKOFI') {
            this.payment.ikofi.amount = channel.totalAmountPaid;
            this.payment.ikofi.transactions = channel.numberOfTransaction;
          }
          if (channel.channelName === 'CASH') {
            this.payment.cash.amount = channel.totalAmountPaid;
            this.payment.cash.transactions = channel.numberOfTransaction;
          }
        });
        if (pieChartData && pieChartData.length) {
          this.paymentPartitionsGraph.data = pieChartData;
        }
        if (columnChartData && columnChartData.length) {
          this.channelsGraph.data = columnChartData;
        }
        this.loading = false;
      });

    } else {
      this.errors = this.helperService.getFormValidationErrors(this.filterForm);
      return;
    }
  }

  onClearFilter() {
    this.filterForm.controls.date.get('from'.toString()).setValue(this.datePipe.transform(this.seasonStartingTime,
      'yyyy-MM-dd', 'GMT+2'));
    this.filterForm.controls.date.get('to'.toString()).setValue(this.datePipe.transform(new Date(), 'yyyy-MM-dd',
      'GMT+2'));
    this.onSubmit();
  }

}
