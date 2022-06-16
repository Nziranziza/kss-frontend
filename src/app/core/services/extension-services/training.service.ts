import {Injectable} from '@angular/core';
import {ApiService} from '../api.service';

@Injectable({
  providedIn: 'root'
})

export class TrainingService {

  constructor(private apiService: ApiService) {
  }
  create(body: any) {
    return this.apiService.post('/v1.1/trainings', body);
  }
  uploadMaterial(body: any){
    return this.apiService.post('/thirdparty/organizations/map/excel', body);
  }
  uploadAllMaterial(body: any){
    return this.apiService.post('/thirdparty/organizations/map/excel', body);
  }
}
