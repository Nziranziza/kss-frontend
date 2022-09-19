import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root',
})
export class VisitService {
  constructor(private apiService: ApiService) {}

  create(body: any) {
    return this.apiService.post('/v1.1/farm-visit-schedules/', body);
  }

  all(body: any): Observable<any> {
    return this.apiService.post('/v1.1/farm-visit-schedules/reference', body);
  }

  one(id: string): Observable<any> {
    return this.apiService.get('/v1.1/farm-visit-schedules/' + id);
  }

  delete(id: string): Observable<any> {
    return this.apiService.delete('/v1.1/farm-visit-schedules/' + id);
  }

  sendSms(id: string): Observable<any> {
    return this.apiService.get('/v1.1/farm-visit-schedules/sms/' + id);
  }

  edit(id: string, body: any): Observable<any> {
    return this.apiService.put('/v1.1/farm-visit-schedules/' + id, body);
  }

  getVisitsStats(body: any) {
    return this.apiService.post('/v1.1/farm-visit-schedules/stats', body);
  }
}
