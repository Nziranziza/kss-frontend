import {Injectable} from '@angular/core';
import {isNullOrUndefined} from 'util';

@Injectable({
  providedIn: 'root'
})
export class ParchmentTransferService {

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
