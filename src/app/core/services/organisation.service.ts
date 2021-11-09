import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';
import {Organisation} from '../models';


@Injectable()
export class OrganisationService {
  constructor(
    private apiService: ApiService
  ) {
  }

  all(): Observable<any> {
    return this.apiService.get('/organizations');
  }

  get(id: string): Observable<any> {
    return this.apiService.get('/organizations/' + id);
  }

  getCwsSummary(id: string): Observable<any> {
    return this.apiService.get('/cwsstats/summary/cws/' + id);
  }

  destroy(body: any): Observable<any> {
    return this.apiService.post('/organizations/remove', body);
  }

  save(organisation: Organisation): Observable<any> {
    return this.apiService.post('/organizations/', organisation);
  }

  update(organisation: Organisation, id: string): Observable<any> {
    return this.apiService.put('/organizations/' + id, organisation);
  }

  possibleRoles(): Observable<any> {
    return this.apiService.get('/organizations/organization.roles/list');
  }

  orgRoles(id: string) {
    return this.apiService.get('/organizations/organization.roles/list' + id);
  }

  getOrgsByRoles(body: any) {
    return this.apiService.post('/organizations/by/roles', body);
  }

  getOrgFarmers(id: string): Observable<any> {
    return this.apiService.get('/coffeefarmers/farmer_by_cws/' + id);
  }

  getOrgPendingFarmers(id: string, body: any): Observable<any> {
    return this.apiService.post('/pendingfarmers/tempofarmer_by_cws/' + id, body);
  }

  getAllOrgPendingFarmers(id: string): Observable<any> {
    return this.apiService.get('/pendingfarmers/tempofarmer_by_cws/' + id);
  }

  getAllFarmers(id: string) {
    return this.apiService.get('/coffeefarmers/farmer_by_cws/' + id);
  }

  getFarmers(body: any) {
    return this.apiService.post('/coffeefarmers/farmer_by_cws/', body);
  }

  getSuppliers(body: any) {
    return this.apiService.post('/cherrysupply/farmer_by_cws/status', body);
  }

  selectSuppliersOnPayment(body: any) {
    return this.apiService.post('/cherrysupply/payment/status', body);
  }

  getSingleSupplier(body: any) {
    return this.apiService.post('/cherrysupply/single_farmer_by_cws/status', body);
  }

  orgPaymentChannels(id: string): Observable<any> {
    return this.apiService.get('/organizations/payment_channels/list/' + id);
  }

  orgAddPaymentChannels(body: any): Observable<any> {
    return this.apiService.post('/organizations/payment_channels', body);
  }

  orgEditPaymentChannel(body: any): Observable<any> {
    return this.apiService.put('/organizations/payment_channels/edit', body);
  }

  orgCertificates(id: string): Observable<any> {
    return this.apiService.get('/organizations/certificates/list/' + id);
  }

  getCertificate(id: string): Observable<any> {
    return this.apiService.get('/organizations/certificates/' + id);
  }

  registerCertificate(body: any): Observable<any> {
    return this.apiService.post('/organizations/certificates/create', body);
  }

  updateCertificate(body: any): Observable<any> {
    return this.apiService.put('/organizations/certificates/update', body);
  }

  deleteCertificate(id: string): Observable<any> {
    return this.apiService.delete('/organizations/certificates/delete/' + id);
  }

  allowSetPinOrgUsers(body: any): Observable<any> {
    return  this.apiService.post('/organizations/enable/set_pin/all', body);
  }

}
