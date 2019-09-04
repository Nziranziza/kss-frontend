import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private subject = new Subject<any>();
  message: string;

  sendMessage(message: string) {
    this.subject.next({text: message});
  }

  clearMessage() {
    this.subject.next();
  }

  receiveMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  getMessage(): string {
    return this.message;
  }

  setMessage(value: string) {
    this.message = value;
  }
}
