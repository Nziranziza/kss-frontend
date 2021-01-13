import {Injectable} from '@angular/core';
import {isNullOrUndefined} from 'util';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ParchmentTransferService {

  constructor(private apiService: ApiService) {
  }

  resetCart() {
    localStorage.removeItem('parchmentTransferCart');
  }

  getCart() {
    if (!isNullOrUndefined(localStorage.getItem('parchmentTransferCart'))) {
      return JSON.parse(localStorage.getItem('parchmentTransferCart'));
    } else {
      return [];
    }
  }

  setCart(value: any) {
    localStorage.setItem('parchmentTransferCart', JSON.stringify(value));
  }
}
