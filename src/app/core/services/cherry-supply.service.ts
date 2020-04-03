import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CherrySupplyService {

  constructor(private apiService: ApiService) {
  }

  saveDelivery(data: any): Observable<any> {
    return this.apiService.post('/cherrysupply/record_delivery/', data);
  }

  paySupplies(data: any): Observable<any> {
    return this.apiService.post('/cherrysupply/record_cash_payment', data);
  }

  getFarmerUnapprovedDeliveries(orgId: string, regNumber: string) {
    return this.apiService.get('/cherrysupply/farmer_unapproved_delivery/list/' + orgId + '/' + regNumber);
  }

  getFarmerUnapprovedPayment(orgId: string, regNumber: string) {
    return this.apiService.get('/cherrysupply/farmer_unapproved_payment/list/' + orgId + '/' + regNumber);
  }

  getFarmerUnpaidDeliveries(orgId: string, regNumber: string) {
    return this.apiService.get('/cherrysupply/farmer_unpaid_delivery/list/' + orgId + '/' + regNumber);
  }

  getFarmerDeliveries(orgId: string, regNumber: string) {
    return this.apiService.get('/cherrysupply/farmer_supply/list/' + orgId + '/' + regNumber);
  }

  report(data: any) {
    return this.apiService.post('/cwsstats/cherrysupply/', data);
  }

  cancelSupply(data: any) {
    return this.apiService.post('/cherrysupply/cancel/supply', data);
  }
}
