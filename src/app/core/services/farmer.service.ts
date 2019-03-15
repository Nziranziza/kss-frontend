import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';
import {Farmer} from '../models';


@Injectable()
export class FarmerService {
  constructor(
    private apiService: ApiService
  ) {
  }

  all(): Observable<any[]> {
    return this.apiService.get('/farmers');
  }

  get(id: number): Observable<any> {
    return this.apiService.get('/farmers/' + id);
  }

  destroy(id: number): Observable<any> {
    return this.apiService.delete('/farmers/' + id);
  }

  save(farmer: Farmer): Observable<any> {
    // If we're updating an existing organisation
    if (farmer.id) {
      return this.apiService.put('/farmers/' + farmer.id, farmer);
      // Otherwise, create a new organisation
    } else {
      return this.apiService.post('/farmers/', farmer);
    }
  }
}
