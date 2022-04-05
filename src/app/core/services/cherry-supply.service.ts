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

  getFarmerDeliveries(orgId: string, regNumber: string) {
    return this.apiService.get('/cherrysupply/farmer_supply/list/' + orgId + '/' + regNumber);
  }

  getFarmerDeliveriesStats(data: any) {
    return this.apiService.post('/cherrysupply/farmer_supply/stats', data);
  }

  report(data: any) {
    return this.apiService.post('/cwsstats/cherrysupply/', data);
  }

  cancelSupply(data: any) {
    return this.apiService.post('/cherrysupply/cancel/supply', data);
  }

  getDetailedDeliveries(data: any): Observable<any> {
    return this.apiService.post('/payment/detail/deliveries', data);
  }
}
