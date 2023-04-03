import { ApiService } from './api.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IntegrationsService {

  constructor(private apiService: ApiService) { }

  getIntegrations() {
    return this.apiService.get('/v1.1/applications')
  }

  createIntegration(body: any) {
    return this.apiService.post('/v1.1/applications', body)
  }

  updateIntegration(id: string, body: any) {
    return this.apiService.put(`/v1.1/applications/${id}`, body)
  }

  regenerateAppKey(id: string) {
    return this.apiService.post(`/v1.1/applications/${id}/keys`, {})
  }
}
