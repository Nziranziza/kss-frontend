import { Injectable } from '@angular/core';
import {ValidationErrors} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  getFormValidationErrors(form) {
    const errors = [];
    Object.keys(form.controls).forEach(key => {

      const controlErrors: ValidationErrors = form.get(key).errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          errors.push('The ' + key + ' field is ' + keyError);
        });
      }
    });
    return errors;
  }
  cleanObject(obj) {
    for (const propName in obj) {
      if (obj[propName] === '' || obj[propName] === undefined) {
        delete obj[propName];
      }
    }
  }
}
