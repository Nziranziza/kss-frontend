import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(private apiService: ApiService) {}

  groupStats(body: any): Observable<any> {
    return this.apiService.post('/v1.1/groups/statistics', body);
  }

  groupSummary(body: any): Observable<any> {
    return this.apiService.post('/v1.1/groups/report', body);
  }

  groupDownload(body: any, type: string): Observable<any> {
    return this.apiService.post("/v1.1/groups/report/download/" + type, body);
  }

  trainingStats(body: any): Observable<any> {
    return this.apiService.post('/v1.1/schedules/statistics', body);
  }

  trainingSummary(body: any): Observable<any> {
    return this.apiService.post('/v1.1/schedules/report', body);
  }

  trainingDownload(body: any, type: string): Observable<any> {
    return this.apiService.post(
      "/v1.1/schedules/report/download/" + type,
      body
    );
  }

  visitStats(body: any): Observable<any> {
    return this.apiService.post('/v1.1/farm-visit-conducts/statistics', body);
  }

  visitSummary(body: any): Observable<any> {
    return this.apiService.post('/v1.1/farm-visit-conducts/report', body);
  }

  visitDownload(body: any, type: string): Observable<any> {
    return this.apiService.post(
      "/v1.1/farm-visit-conducts/report/download/" + type,
      body
    );
  }
}
