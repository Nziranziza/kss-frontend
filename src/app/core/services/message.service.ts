import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private message: string;
  private error: string;

  getMessage(): string {
    return this.message;
  }

  setMessage(value: string) {
    this.message = value;
  }

  clearMessage() {
    this.message = undefined;
  }

  getError(): string {
    return this.message;
  }

  setError(value: string) {
    this.message = value;
  }

  clearError() {
    this.error = undefined;
  }
}
