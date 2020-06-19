import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {PaymentProcessingService} from '../../../../core/services/payment-processing.service';
import {Subject} from 'rxjs';
import {AuthenticationService} from '../../../../core/services';

@Component({
  selector: 'app-preview-deliveries-list',
  templateUrl: './preview-deliveries-list.component.html',
  styleUrls: ['./preview-deliveries-list.component.css']
})
export class PreviewDeliveriesListComponent implements OnInit {

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              private paymentProcessingService: PaymentProcessingService) {
  }

  selectedDeliveries: any;
  paymentList: any;
  paymentRequest: any;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  totalAmountPaid = 0;
  organisationId: string;
  userId: any;

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.organisationId = this.authenticationService.getCurrentUser().info.org_id;
    this.userId = this.authenticationService.getCurrentUser().info._id;
    this.selectedDeliveries = this.paymentProcessingService.getSelectedDeliveries();
    this.paymentList = this.selectedDeliveries.reduce((results, supplier) => {
      if (supplier.selected) {
        results.push(
          {
            firstName: supplier.userInfo.type === 2 ? supplier.userInfo.groupName : supplier.userInfo.foreName,
            surname: supplier.userInfo.surname,
            phone_number: supplier.userInfo.phone_number,
            regNumber: supplier.userInfo.regNumber,
            amount: this.getOwedAmount(supplier.deliveries),
            deliveries: this.getDeliveries(supplier.deliveries)
          });
      }
      return results;
    }, []);

    this.paymentRequest = {
      totalAmountPaid: this.totalAmountPaid,
      org_id: this.organisationId,
      userId: this.userId,
      beneficiaries: this.paymentList
    };

    this.paymentProcessingService.setPaymentList(this.paymentRequest);
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
    this.totalAmountPaid = this.totalAmountPaid + sum;
    return sum;
  }

  getDeliveries(deliveries: any) {
    const ids = [];
    deliveries.map((delivery) => {
      if (delivery.selected) {
        ids.push(delivery._id);
      }
    });
    return ids;
  }


  onNext() {
    this.router.navigateByUrl('admin/pay-farmers/confirm-payment');
  }

  onPrevious() {
    this.router.navigateByUrl('admin/pay-farmers/select-deliveries');
  }
}
