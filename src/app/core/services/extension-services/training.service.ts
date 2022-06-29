import { Injectable } from "@angular/core";
import { ApiService } from "../api.service";
import { Training } from "../../models";

@Injectable({
  providedIn: "root",
})
export class TrainingService {
  constructor(private apiService: ApiService) {}
  create(body: any) {
    return this.apiService.post("/v1.1/trainings", body);
  }
  all() {
    return this.apiService.get("/v1.1/trainings");
  }
  one(id: string) {
    return this.apiService.get("/v1.1/trainings/" + id);
  }
  delete(id: string) {
    return this.apiService.delete("/v1.1/trainings/" + id);
  }
  update(body: Training, id: string) {
    return this.apiService.put("/v1.1/trainings/" + id, body);
  }
  uploadMaterial(body: any) {
    return this.apiService.post("/v1.1/trainings/materials", body);
  }
  getFarmersByGroup(id: string, body: any) {
    console.log(id);
    return this.apiService.post("/v1.1/groups/attendance/" + id, body);
  }

  scheduleTraining(body: any) {
    return this.apiService.post("/v1.1/schedules", body);
  }
}
