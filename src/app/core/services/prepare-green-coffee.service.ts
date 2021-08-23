import {Injectable} from '@angular/core';
import {isNullOrUndefined} from 'util';

@Injectable({
  providedIn: 'root'
})
export class PrepareGreenCoffeeService {

  resetCart() {
    localStorage.removeItem('prepareGreenCoffee');
  }

  getCart() {
    if (!isNullOrUndefined(localStorage.getItem('prepareGreenCoffee'))) {
      return JSON.parse(localStorage.getItem('prepareGreenCoffee'));
    } else {
      return [];
    }
  }

  setCart(value: any) {
    localStorage.setItem('prepareGreenCoffee', JSON.stringify(value));
  }
}
