import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DryProcessingService {

  constructor(private apiService: ApiService) { }

  prepareGreenCoffee(body: any) {
    return this.apiService.post('/dmparchment/prepare/green_coffee', body);
  }

  saveGreenCoffee(body: any) {
    return this.apiService.post('/greencoffee/save', body);
  }

  updateGreenCoffee(body: any, id: string) {
    return this.apiService.post('/greencoffee/update/' + id, body);
  }

  uploadGreenCoffeeResults(body: any) {
    return this.apiService.post('/greencoffee/upload/results', body);
  }

  getSupplyingOrg(orgId: string) {
    return this.apiService.get('/dmparchment/suppliers/' + orgId);
  }

  cancelGreenCoffee(id: string) {
    return this.apiService.delete('/greencoffee/delete/' + id);
  }

  cancelGreenCoffeeItem(id: string) {
    return this.apiService.delete('/greencoffee/delete/item/' + id);
  }

  cancelTransfer(id: string) {
    return this.apiService.delete('/greencoffee/delete/transfer/' + id);
  }

  cancelTransferItem(id: string) {
    return this.apiService.delete('/greencoffe/delete/transfer/item/' + id);
  }

  getGreenCoffeeStockSummary(body: any) {
    return this.apiService.post('/greencoffee/stock/summary', body);
  }

  getGreenCoffeeResultSummary(body: any) {
    return this.apiService.post('/greencoffee/results/stock/summary', body);
  }

  getGreenCoffee(body: any) {
    return this.apiService.post('/greencoffee/list', body);
  }

  getCWSGreenCoffee(body: any) {
    return this.apiService.post('/greencoffee/list/by_cws', body);
  }

  cwsHasGreenCoffee(id: string) {
    return this.apiService.get('/greencoffee/cws/has/processing/' + id);
  }

  getGreenCoffeeGrades() {
    return this.apiService.get('/greencoffee/grades/list');
  }

  getOneGreenCoffee(orgId: string, id: string) {
    return this.apiService.get('/greencoffee/find/' + orgId + '/' + id);
  }

  prepareGreenCoffeeTransfer(body: any) {
    return this.apiService.post('/greencoffee/prepare/transfer', body);
  }

  transferGreenCoffee(body: any) {
    return this.apiService.post('/greencoffee/transfer', body);
  }

  printDeliveryNote(id: string): Observable<any> {
    return this.apiService.get('/greencoffee/download/deliveries/note/' + id);
  }

  getTransferHistory(body: any): Observable<any> {
    return this.apiService.post('/greencoffee/transfers/list', body);
  }

  getTransfersSummary(body: any): Observable<any> {
    return this.apiService.post('/greencoffee/transfers/summary', body);
  }

}
