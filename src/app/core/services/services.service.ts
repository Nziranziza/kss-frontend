import { Observable } from 'rxjs';
import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";

@Injectable()
export class ServicesService {
  constructor(private apiService: ApiService){
  }

  all():Observable<any> {
    return this.apiService.get('/v1.1/services');
  }
}