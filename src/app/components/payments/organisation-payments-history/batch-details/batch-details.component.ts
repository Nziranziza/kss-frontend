import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, Inject, Injector, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PaymentHistoryDetailsComponent } from '../payment-history-details/payment-history-details.component';

@Component({
  selector: 'app-batch-details',
  templateUrl: './batch-details.component.html',
  styleUrls: ['./batch-details.component.css']
})
export class BatchDetailsComponent implements OnInit {

  modal: NgbActiveModal
  status: any;
  @Input() batch: any = {
    beneficiaries: []
  }
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
    private nModal: NgbModal,
  ) { 
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit(): void {
    this.getPaymentsStatus();
  }

  viewStatus(value: number) {
    return this.status.find(el => el.value === value).name;
  }

  viewDeliveries(regNumber: string, paidDeliveries: any) {
    const modalRef = this.nModal.open(PaymentHistoryDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.regNumber = regNumber;
    modalRef.componentInstance.deliveries = paidDeliveries;
  }

  getPaymentsStatus() {
    const object = {
      PENDING: 0,
      SUCCESS: 1,
      FAILED: 2,
      REJECTED: 3
    };
    this.status = Object.keys(object).map(key => {
      return {name: key, value: object[key]};
    });
  }

}
