import {Injectable} from '@angular/core';
import {isNullOrUndefined} from 'util';

@Injectable({
  providedIn: 'root'
})

export class PaymentProcessingService {
  constructor(
  ) {}

  getSelectedDeliveries() {
    if (!isNullOrUndefined(localStorage.getItem('paymentProcessing'))) {
      return JSON.parse(localStorage.getItem('paymentProcessing')).selectedDeliveries;
    }
  }

  setSelectedDeliveries(value: any) {
    if (isNullOrUndefined(localStorage.getItem('paymentProcessing'))) {
      localStorage.setItem('paymentProcessing', JSON.stringify(
        {selectedDeliveries: value}
      ));
    } else {
      const current = JSON.parse(localStorage.getItem('paymentProcessing'));
      current.selectedDeliveries = value;
      localStorage.setItem('paymentProcessing', JSON.stringify(current));
    }
  }

  getPaymentList() {
    if (!isNullOrUndefined(localStorage.getItem('paymentProcessing'))) {
      return JSON.parse(localStorage.getItem('paymentProcessing')).paymentList;
    }
  }

  setPaymentList(value: any) {
    if (isNullOrUndefined(localStorage.getItem('paymentProcessing'))) {
      localStorage.setItem('paymentProcessing', JSON.stringify(
        {paymentList: value}
      ));
    } else {
      const current = JSON.parse(localStorage.getItem('paymentProcessing'));
      current.paymentList = value;
      localStorage.setItem('paymentProcessing', JSON.stringify(current));
    }
  }


  getSelectionFilter() {
    if (!isNullOrUndefined(localStorage.getItem('paymentProcessing'))) {
      return JSON.parse(localStorage.getItem('paymentProcessing')).selectionFilter;
    }
  }

  setSelectionFilter(value: any) {
    if (isNullOrUndefined(localStorage.getItem('paymentProcessing'))) {
      localStorage.setItem('paymentProcessing', JSON.stringify(
        {selectionFilter: value}
      ));
    } else {
      const current = JSON.parse(localStorage.getItem('paymentProcessing'));
      current.selectionFilter = value;
      localStorage.setItem('paymentProcessing', JSON.stringify(current));
    }
  }

  getSelectionStatistics() {
    if (!isNullOrUndefined(localStorage.getItem('paymentProcessing'))) {
      return JSON.parse(localStorage.getItem('paymentProcessing')).selectionStatistics;
    }
  }

  setSelectionStatistics(value: any) {
    if (isNullOrUndefined(localStorage.getItem('paymentProcessing'))) {
      localStorage.setItem('paymentProcessing', JSON.stringify(
        {selectionStatistics: value}
      ));
    } else {
      const current = JSON.parse(localStorage.getItem('paymentProcessing'));
      current.selectionStatistics = value;
      localStorage.setItem('paymentProcessing', JSON.stringify(current));
    }
  }
}
