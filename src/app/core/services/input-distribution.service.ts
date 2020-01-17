import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})

export class InputDistributionService {


  constructor(private apiService: ApiService) {
  }

  getFarmerRequests(regNumber: any): Observable<any> {
    return this.apiService.post('/site/distribution/farmer_requests', regNumber);
  }

  recordDispatch(body: any): Observable<any> {
    return this.apiService.post('/inputdispatch/record_dispatch', body);
  }

  report(data: any): Observable<any> {
    return this.apiService.post('/distributionstats/plan?subRegions=true', data);
  }

  getSiteDispatches(siteId: string) {
    return this.apiService.get('/inputdispatch/site/dispatch/' + siteId);
  }

  printDispatchEntryNote(dispatchId: string) {
    return this.apiService.get('/inputdispatch/generate/site/goods_entry_note/' + dispatchId);
  }

  getSiteStockOuts(siteId: string) {
    return this.apiService.get('/inputapplication/' + siteId);
  }

  recordStockOut(body: any): Observable<any> {
    return this.apiService.post('/inputapplication/record_stockout', body);
  }

  recordStockOutReturn(body: any): Observable<any> {
    return this.apiService.put('/inputapplication/record_stockreturn', body);
  }

  recordDistribution(data: any): Observable<any> {
    return this.apiService.post('/inputapplication/record_distribution', data);
  }

  recordDistributionAndUpdate(data: any): Observable<any> {
    return this.apiService.post('/inputapplication/record_distribution_and_update', data);
  }

  applyPesticide(data: any): Observable<any> {
    return this.apiService.post('/inputapplication/record_pesticide_distribution', data);
  }

  updateRequestAtDistribution(data: any): Observable<any> {
    return this.apiService.put('/coffeefarmers/site/requestinfo/edit', data);
  }

  confirmDispatch(data: any): Observable<any> {
    return this.apiService.put('/inputdispatch/confirm_dispatch', data);
  }

  getDistributionProgress(data: any): Observable<any> {
    return this.apiService.post('/distributionstats/inputdistribution', data);
  }

  getDistributionProgressPesticide(data: any): Observable<any> {
    return this.apiService.post('/distributionstats/pesticide/inputdistribution', data);
  }

  getDistributionProgressDetail(data: any): Observable<any> {
    return this.apiService.post('/distributionstats/detailed/inputdistribution', data);
  }

  getDistributionProgressPesticideDetail(data: any): Observable<any> {
    return this.apiService.post('/distributionstats/detailed/pesticide_inputdistribution', data);
  }

  getDispatchProgress(data: any): Observable<any> {
    return this.apiService.post('/distributionstats/inputdispatch', data);
  }

  recordInput(data: any): Observable<any> {
    return this.apiService.post('/inputs', data);
  }

  recordSupplier(data: any): Observable<any> {
    return this.apiService.post('/supplier/set', data);
  }

  updateInput(data: any): Observable<any> {
    return this.apiService.put('/inputs/edit', data);
  }

  updateSupplier(data: any): Observable<any> {
    return this.apiService.put('/supplier/edit', data);
  }
  getFertilizers(): Observable<any> {
    return this.apiService.get('/inputs/fertilizer');
  }

  getPesticides(): Observable<any> {
    return this.apiService.get('/inputs/pesticide');
  }


  getSuppliers(): Observable<any> {
    return this.apiService.get('/supplier');
  }

  getStock(stock: number, siteId?: string) {
    if (siteId) {
      return this.apiService.get('/stock/?' + 'stockType=' + stock + '&' + 'siteId=' + siteId);
    } else {
      return this.apiService.get('/stock/?' + 'stockType=' + stock);
    }
  }
}
