import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  message: string;
  constructor() {
  }

  getMessage(): string {
    return this.message;
  }

  setMessage(value: string) {
    this.message = value;
  }
}
