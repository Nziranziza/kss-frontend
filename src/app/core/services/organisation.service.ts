import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';
import {Organisation} from '../models';


@Injectable()
export class OrganisationService {
  constructor(
    private apiService: ApiService
  ) {
  }

  all(): Observable<any> {
    return this.apiService.get('/organizations');
  }

  get(id: string): Observable<any> {
    return this.apiService.get('/organizations/' + id);
  }

  getCwsSummary(id: string): Observable<any> {
    return this.apiService.get('/cwsstats/summary/cws/' + id);
  }

  destroy(id: string): Observable<any> {
    return this.apiService.delete('/organizations/' + id);
  }

  save(organisation: Organisation): Observable<any> {
    return this.apiService.post('/organizations/', organisation);
  }

  update(organisation: Organisation, id: string): Observable<any> {
    return this.apiService.put('/organizations/' + id, organisation);
  }

  possibleRoles(): Observable<any> {
    return this.apiService.get('/organizations/organization.roles/list');
  }

  orgRoles(id: string) {
    return this.apiService.get('/organizations/organization.roles/list' + id);
  }

  getOrgFarmers(id: string): Observable<any> {
    return this.apiService.get('/coffeefarmers/farmer_by_cws/' + id);
  }

  getOrgPendingFarmers(id: string, body: any): Observable<any> {
    return this.apiService.post('/pendingfarmers/tempofarmer_by_cws/' + id, body);
  }

  getAllOrgPendingFarmers(id: string): Observable<any> {
    return this.apiService.get('/pendingfarmers/tempofarmer_by_cws/' + id);
  }

  getAllFarmers(id: string) {
    return this.apiService.get('/coffeefarmers/farmer_by_cws/' + id);
  }

  getFarmers(body: any) {
    return this.apiService.post('/coffeefarmers/farmer_by_cws/', body);
  }
}
