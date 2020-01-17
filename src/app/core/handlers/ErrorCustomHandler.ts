import {ErrorHandler, Injectable} from '@angular/core';

@Injectable()
export class ErrorCustomHandler implements ErrorHandler {
  constructor() {
  }

  handleError(error) {
    console.log(error);
  }
}
