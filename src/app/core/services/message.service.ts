import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private observer: any;
  private message: string;
  private observerMessage: string;

  sendMessage(message: string) {
    this.observer = new Observable(observer => {
      observer.next(message);
      observer.complete();
    });
  }

  receiveMessage(): string {
    this.observer.subscribe({
      next: ((value) => {
        this.observerMessage = value;
      })
    });
    return this.observerMessage;
  }

  getMessage(): string {
    return this.message;
  }

  setMessage(value: string) {
    this.message = value;
  }
}
