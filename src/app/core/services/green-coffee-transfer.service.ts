import { Injectable } from '@angular/core';
import {isNullOrUndefined} from 'util';

@Injectable({
  providedIn: 'root'
})
export class GreenCoffeeTransferService {

  resetCart() {
    localStorage.removeItem('greenCoffeeTransferCart');
  }

  getCart() {
    if (!isNullOrUndefined(localStorage.getItem('greenCoffeeTransferCart'))) {
      return JSON.parse(localStorage.getItem('greenCoffeeTransferCart'));
    } else {
      return [];
    }
  }

  setCart(value: any) {
    localStorage.setItem('greenCoffeeTransferCart', JSON.stringify(value));
  }
}
