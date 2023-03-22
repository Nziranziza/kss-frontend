import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, Inject, Injector, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.css']
})
export class PaymentDetailsComponent implements OnInit {

  modal: NgbActiveModal;
  statuses = ['PENDING', 'SUCCESS', 'FAILED', 'REJECTED'];
  paymentChannels = ['', 'AIRTEL MONEY', 'MTN MOBILE MONEY', 'IKOFI', 'CASH', 'BANK'];
  @Input() payment: any = {
    transactions: [],
  };
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
   }

  ngOnInit(): void {
  }

}
