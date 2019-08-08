import { Injectable } from '@angular/core';
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
  recordDispatch(body: any) {
    return this.apiService.post('/inputdispatch/record_dispatch', body);
  }
  report(data: any, subRegions: boolean): Observable<any> {
    if (subRegions) {
      return this.apiService.post('/distributionstats/plan?subRegions=true', data);
    } else {
      return this.apiService.post('/distributionstats/plan', data);
    }
  }
}
