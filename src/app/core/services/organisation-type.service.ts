import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {Observable} from 'rxjs';
import {OrganisationType} from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrganisationTypeService {

  constructor(
    private apiService: ApiService
  ) { }

  all(): Observable<any> {
    return this.apiService.get('/orgtypes');
  }

  get(id: string): Observable<any> {
    return this.apiService.get('/orgtypes/' + id);
  }

  destroy(id: string): Observable<any> {
    return this.apiService.delete('/orgtypes/' + id);
  }

  save(organisationType: OrganisationType): Observable<any> {
    if (organisationType._id) {
      const orgType = { genre: organisationType.genre};
      return this.apiService.put('/orgtypes/' + organisationType._id, orgType);
    } else {
      return this.apiService.post('/orgtypes/', organisationType);
    }
  }

  organisations(organisationTypeId: string): Observable<any> {
    return this.apiService.get('/orgtypes/' + organisationTypeId + 'organizations');
  }
}
