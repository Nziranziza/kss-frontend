import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private apiService: ApiService) {
  }

  createChannel(body: any): Observable<any> {
    return this.apiService.post('/paymentchannel', body);
  }

  listChannels(): Observable<any> {
    return this.apiService.get('/paymentchannel');
  }

  getChannel(id: string): Observable<any> {
    return this.apiService.get('/paymentchannel/' + id);
  }

  listChannelsConstants(): Observable<any> {
    return this.apiService.get('/organizations/payment.channels/list');
  }

  listBanks(): Observable<any> {
    return this.apiService.get('/organizations/banks/list');
  }

  payCherries(data: any): Observable<any> {
    return this.apiService.post('/payment/cherries', data);
  }

  getPaymentHistory(body: any): Observable<any> {
    return this.apiService.post('/payment/list', body);
  }

  getPaymentsReport(body: any): Observable<any> {
    return this.apiService.post('/paymentstats', body);
  }
}
