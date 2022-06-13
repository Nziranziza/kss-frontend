import {Injectable} from '@angular/core';
import {ApiService} from '../api.service';

@Injectable({
  providedIn: 'root'
})

export class GroupService {

  constructor(private apiService: ApiService) {
  }
  create(body: any) {
    return this.apiService.post('/v1.1/groups', body);
  }
}
