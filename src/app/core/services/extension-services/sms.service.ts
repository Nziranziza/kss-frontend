import { Injectable } from "@angular/core";
import { ApiService } from "../api.service";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class SmsService {
  constructor(private apiService: ApiService) {}

  createOrder(body: any) {
    return this.apiService.post("/v1.1/sms/orders", body);
  }

  getBalance(id: string): Observable<any> {
    return this.apiService.get("/v1.1/sms/balance/" + id);
  }

  allSms(): Observable<any> {
    return this.apiService.get("/v1.1/sms");
  }

  allOrder(id: string): Observable<any> {
    return this.apiService.get("/v1.1/sms/orders/" + id);
  }

  getSmsHistory(filters?: any): Observable<any> {
    const params = new HttpParams({ fromObject: filters })
    return this.apiService.get("/v1.1/sms/history", params)
  }
}
