import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private message: string;

  getMessage(): string {
    return this.message;
  }

  setMessage(value: string) {
    this.message = value;
  }

  clearMessage() {
    this.message = undefined;
  }
}
