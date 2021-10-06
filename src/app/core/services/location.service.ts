import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private apiService: ApiService) {
  }

  getProvinces() {
    return this.apiService.get('/provinces');
  }

  getDistricts(id: any) {
    return this.apiService.get('/districts/' + id);
  }

  getSectors(id: any) {
    return this.apiService.get('/sectors/' + id);
  }

  getCells(id: any) {
    return this.apiService.get('/cells/' + id);
  }

  getVillages(id: any) {
    return this.apiService.get('/villages/' + id);
  }

  getCoveredVillages(id: string): Observable<any> {
    return this.apiService.get('/organizations/villages/list/' + id);
  }
}
