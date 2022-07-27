import { Injectable } from "@angular/core";
import { ApiService } from "../api.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ReportService {
  constructor(private apiService: ApiService) {}

  groupStats(body: any): Observable<any> {
    return this.apiService.post("/v1.1/groups/statistics", body);
  }

  groupSummary(body: any): Observable<any> {
    return this.apiService.post("/v1.1/groups/report", body);
  }

  groupDownload(body: any): Observable<any> {
    return this.apiService.post("/v1.1/groups/report/download", body);
  }
}
