import {ErrorHandler, Injectable} from '@angular/core';
import {Location} from '@angular/common';

@Injectable()
export class ErrorCustomHandler implements ErrorHandler {
  constructor(private location: Location) {
  }

  handleError(error) {
    if ((!(error instanceof TypeError)) && (error.status === undefined)) {
      console.log(error);
      this.location.back();
    }
  }
}
