import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {PaymentProcessingService} from '../../../core/services/payment-processing.service';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-preview-deliveries-list',
  templateUrl: './preview-deliveries-list.component.html',
  styleUrls: ['./preview-deliveries-list.component.css']
})
export class PreviewDeliveriesListComponent implements OnInit {

  constructor(private router: Router,
              private paymentProcessingService: PaymentProcessingService) {
  }

  selectedDeliveries: any;
  paymentList: any;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.selectedDeliveries = this.paymentProcessingService.getSelectedDeliveries();
    this.paymentList = this.selectedDeliveries.reduce((results, supplier) => {
      if (supplier.selected) {
        results.push({
          firstName: supplier.userInfo.type === 2 ? supplier.userInfo.groupName : supplier.userInfo.foreName,
          surname: supplier.userInfo.surname,
          phone_number: supplier.userInfo.phone_number,
          regNumber: supplier.userInfo.regNumber,
          amountToPay: this.getOwedAmount(supplier.deliveries)
        });
      }
      return results;
    }, []);
    this.paymentProcessingService.setPaymentList(this.paymentList);
    setTimeout(function() {
      this.dtTrigger.next();
    }.bind(this));
  }

  getOwedAmount(deliveries: any) {
    let sum = 0;
    deliveries.map((delivery) => {
      if (delivery.selected) {
        sum = sum + delivery.owedAmount;
      }
    });
    return sum;
  }


  onNext() {
    this.router.navigateByUrl('admin/pay-farmers/confirm-payment');
  }

  onPrevious() {
    this.router.navigateByUrl('admin/pay-farmers/select-deliveries');
  }
}
