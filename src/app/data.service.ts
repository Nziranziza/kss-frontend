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
      {id: 1, name: 'Organisation 1', email: 'organistaion1@org.rw', phoneNumber: '0788880000',
        organisationType: 'naeb', website: 'www.bk.rw'}

    ];

    const farmers = [
      {
        id: 1, userId: 1, userInfo: {
          firstName: 'farmer first name', lastName: 'farmer last name',
          phoneNumber: '0788888888', nationalId: '19701111111111'
        },
        address: 'address', treesNumber: 300, ownsLand: true, upiNumber: '12345', belongsToCooperative: true
      }

    ];

    const users = [
      {id: 1, username: 'admin', email: 'admin@bk.rw'},

    ];

    return {organisations, users, farmers};

  }
}
