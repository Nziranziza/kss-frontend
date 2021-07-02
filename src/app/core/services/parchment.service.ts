import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParchmentService {

  constructor(private apiService: ApiService) {
  }

  all(body: any): Observable<any> {
    return this.apiService.post('/parchment/cws_parchment/list', body);
  }

  allWithFilter(body: any): Observable<any> {
    return this.apiService.post('/parchment/cws_parchment/org/list', body);
  }


  collectParchments(body: any): Observable<any> {
    return this.apiService.post('/parchment/prepare/parchment', body);
  }

  save(body: any) {
    return this.apiService.post('/parchment/record_parchment', body);
  }

  get(orgId: string, id: string) {
    return this.apiService.get('/parchment/cws_parchment/' + orgId + '/' + id);
  }

  transfer(body: any) {
    return this.apiService.post('/parchment/transfer_parchment', body);
  }

  report(data: any) {
    return this.apiService.post('/cwsstats/parchment', data);
  }

  detailedReport(data: any) {
    return this.apiService.post('/cwsstats/detailed/cherry_parchment', data);
  }

  cancelParchment(data: any) {
    return this.apiService.post('/parchment/cancel/parchment', data);
  }

  getTransferHistory(body: any): Observable<any> {
    return this.apiService.post('/parchment/cws_parchment/transfers/org/list', body);
  }


  getDeliveries(body: any): Observable<any> {
    return this.apiService.post('/dmparchment/dm_deliveries', body);
  }

  cancelTransfer(id: string) {
    return this.apiService.delete('/parchment/delete/transfer_parchment/' + id);
  }

  printDeliveryNote(id: string): Observable<any> {
    return this.apiService.get('/parchment/generate/transfer_note/' + id);
  }

  confirmTransfer(body: any): Observable<any> {
    return this.apiService.post('/parchment/transfer/confirm', body);
  }
}
