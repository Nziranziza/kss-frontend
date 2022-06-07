import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from '../api.service';

@Injectable({
  providedIn: 'root'
})

export class GroupService {

  constructor(private apiService: ApiService) {
  }
}
