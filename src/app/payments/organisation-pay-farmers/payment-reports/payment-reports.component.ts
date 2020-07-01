import { Component, OnInit } from '@angular/core';
import {BasicComponent} from '../../../core/library';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-payment-reports',
  templateUrl: './payment-reports.component.html',
  styleUrls: ['./payment-reports.component.css']
})
export class PaymentReportsComponent extends BasicComponent implements OnInit {

  constructor(private formBuilder: FormBuilder) {
    super();
  }

  filterForm: FormGroup;
  paymentPartitionsGraph = {
    title: 'Payment Partitions',
    type: 'PieChart',
    data: [
      ['Airtel', 10],
      ['MTN', 15],
      ['Ikofi', 65],
      ['Cash', 10]
    ],
    columnNames: ['Channel', 'Percentage'],
    options: {
      pieHole: 0.5
    },
    width: 550,
    height: 400
  };
  channelsGraph = {
    title: 'Payment Channels',
    type: 'ColumnChart',
    data: [
      ['Airtel', 10, 15, 65, 10],
      ['MTN', 10, 15, 65, 10],
      ['Ikofi', 10, 15, 65, 10]
    ],
    columnNames: ['Channel', 'Pending', 'Failed', 'Success', 'Rejected'],
    options: {
    },
    width: 550,
    height: 400
  };
  ngOnInit() {
    this.filterForm = this.formBuilder.group({
      date: this.formBuilder.group({
        from: [''],
        to: ['']
      })
    });
  }
}
