import {Injectable} from '@angular/core';
import {ApiService} from '../api.service';
import { Training } from '../../models';

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
    return this.apiService.post('/v1.1/trainings/materials', body);
  }
  all(){
    return this.apiService.get('/v1.1/trainings');
  }
}
