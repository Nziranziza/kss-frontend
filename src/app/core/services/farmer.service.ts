import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';
import {Farmer} from '../models';
import {AuthenticationService} from './authentication.service';
import {observableToBeFn} from 'rxjs/internal/testing/TestScheduler';


@Injectable()
export class FarmerService {
  isDistrictCashCrop = false;

  constructor(
    private apiService: ApiService) {
  }

  all(): Observable<any> {
    return this.apiService.get('/coffeefarmers');
  }

  getFarmers(parameters: any, as?: any): Observable<any> {
    if (as === 'dcc') {
      return this.apiService.post('/coffeefarmers/district/farmers/', parameters);
    } else {
      return this.apiService.post('/coffeefarmers/getfarmers/', parameters);
    }
  }

  get(id: string): Observable<any> {
    return this.apiService.get('/coffeefarmers/' + id);
  }

  destroyRequest(body: any) {
    return this.apiService.put('/coffeefarmers/request/remove', body);
  }

  destroy(id: string): Observable<any> {
    return this.apiService.delete('/farmers/' + id);
  }

  save(farmer: any): Observable<any> {
    return this.apiService.post('/coffeefarmers/createfarmer', farmer);
  }

  update(farmer: Farmer): Observable<any> {
    return this.apiService.put('/farmers/', farmer);
  }

  getPendingFarmers(parameters: any, as?: any): Observable<any> {
    if (as === 'dcc') {
      return this.apiService.post('/pendingfarmers/district/pendingfarmers/', parameters);
    } else {
      return this.apiService.post('/pendingfarmers/gettempofarmers/', parameters);
    }
  }

  getPendingFarmer(id: string): Observable<any> {
    return this.apiService.get('/pendingfarmers/pendingbyid/' + id);
  }

  report(data: any): Observable<any> {
    return this.apiService.post('/stats/farmer.data?subRegions=true', data);
  }

  updateFarmerRequest(data: any): Observable<any> {
    return this.apiService.put('/coffeefarmers/requestinfo/edit', data);
  }

  addFarmerRequest(data: any): Observable<any> {
    return this.apiService.put('/coffeefarmers/request/add', data);
  }

  checkFarmerNID(nid: string): Observable<any> {
    return this.apiService.get('/users/check/nidexists/' + nid);
  }

  checkFarmerGroupName(groupName: string): Observable<any> {
    return this.apiService.get('/users/check/group.exists/' + groupName);
  }

  createFromPending(farmer: any): Observable<any> {
    return this.apiService.post('/pendingfarmers/createfarmerfromtempo/', farmer);
  }

  getFarmerLands(id: string) {
    return this.apiService.get('/coffeefarmers/requests_by_farmer/' + id);
  }

  updateFarmerProfile(data: any): Observable<any> {
    return this.apiService.put('/coffeefarmers/profileinfo/edit/', data);
  }

  approveLandsUpdate(data: any): Observable<any> {
    return this.apiService.put('/coffeefarmers/requestinfo/approve_update', data);
  }
}
