import { Injectable } from "@angular/core";
import { ApiService } from "../api.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SeedlingService {
  constructor(private apiService: ApiService) {}

  create(body: any) {
    return this.apiService.post("/v1.1/farm-visit-schedules/", body);
  }

  all(): Observable<any> {
    return this.apiService.get("/v1.1/nurseries");
  }

  one(id: string): Observable<any> {
    return this.apiService.get("/v1.1/farm-visit-schedules/" + id);
  }

  update(id: string, body: any): Observable<any> {
    return this.apiService.put("/v1.1/farm-visit-schedules/" + id, body);
  }
}
