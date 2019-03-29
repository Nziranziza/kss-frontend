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

  get(id: number): Observable<any> {
    return this.apiService.get('/organizations/' + id);
  }

  destroy(id: number): Observable<any> {
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
}
