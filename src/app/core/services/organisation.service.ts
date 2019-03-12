import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';
import {ApiResponse, Organisation} from '../models';


@Injectable()
export class OrganisationService {
  constructor(
    private apiService: ApiService
  ) {
  }

  all(): Observable<ApiResponse> {
    return this.apiService.get('/organisations');
  }

  get(id): Observable<ApiResponse> {
    return this.apiService.get('/organisations/' + id);
  }

  destroy(id): Observable<ApiResponse> {
    return this.apiService.delete('/organisations/' + id);
  }

  save(organisation: Organisation): Observable<ApiResponse> {
    // If we're updating an existing organisation
    if (organisation.id) {
      return this.apiService.put('/organisations/' + organisation.id, organisation);
      // Otherwise, create a new organisation
    } else {
      return this.apiService.post('/organisations/', organisation);
    }
  }
}
