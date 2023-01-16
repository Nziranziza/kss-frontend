import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SeedlingService {
  constructor(private apiService: ApiService) {}

  create(body: any) {
    return this.apiService.post('/v1.1/nurseries', body);
  }

  all(filters?: any): Observable<any> {
    const queryParams = new HttpParams({
      fromObject: filters
    })
    return this.apiService.get('/v1.1/nurseries', queryParams);
  }

  one(id: string): Observable<any> {
    return this.apiService.get('/v1.1/nurseries/' + id);
  }

  delete(id: string): Observable<any> {
    return this.apiService.delete('/v1.1/nurseries/' + id);
  }

  update(id: string, body: any): Observable<any> {
    return this.apiService.put('/v1.1/nurseries/' + id, body);
  }

  getSeedlingStats(body: any) {
    return this.apiService.post('/v1.1/seedlings/stats', body);
  }

  getSeedlingDistributionByNursery(body: any) {
    return this.apiService.post('/v1.1/seedlings/nursery', body);
  }

  nurseryStats(body: any) {
    return this.apiService.post('/v1.1/nurseries/statistics', body);
  }
}
