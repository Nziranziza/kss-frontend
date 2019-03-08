import {Injectable} from '@angular/core';
import {InMemoryDbService} from 'angular-in-memory-web-api';

@Injectable({
  providedIn: 'root'
})
export class DataService implements InMemoryDbService {

  constructor() {
  }

  createDb() {
    const organisations = [
      {id: 1, name: 'Organisation 1', email: 'organistaion1@org.rw', tin: 1234},
      {id: 2, name: 'Organisation 2', email: 'organistaion2@org.rw', tin: 1234},
    ];

    const users = [
      {id: 1, username: 'admin', email: 'admin@bk.rw', token: 1234 , bio: 'biography', image: 'image'},

    ];

    return { organisations, users };

  }
}
