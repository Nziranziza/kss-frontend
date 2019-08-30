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

  report(data: any, subRegions: boolean): Observable<any> {
    if (subRegions) {
      return this.apiService.post('/distributionstats/plan?subRegions=true', data);
    } else {
      return this.apiService.post('/distributionstats/plan', data);
    }
  }

  getSiteDispatches(siteId: string) {
    return this.apiService.get('/inputdispatch/site/dispatch/' + siteId);
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

  confirmDispatch(data: any) {
    return this.apiService.put('/inputdispatch/confirm_dispatch', data);
  }

  getDistributionProgress(data: any) {
    return this.apiService.post('/distributionstats/inputdistribution?subRegions=true', data);
  }
}
