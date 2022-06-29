import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { GroupService } from "src/app/core";
@Component({
  selector: "app-schedule-farm-visit",
  templateUrl: "./schedule-farm-visit.component.html",
  styleUrls: [
    "../../training/training-scheduling-create/training-scheduling-create.component.css",
  ],
})
export class ScheduleFarmVisitComponent implements OnInit {
  scheduleVisit: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private groupService: GroupService
  ) {}
  loading: Boolean = false;
  farmerGroups: any[] = [];
  ngOnInit() {
    this.scheduleVisit = this.formBuilder.group({
      farmerGroup: ["", Validators.required],
      farm: ["", Validators.required],
      description: ["", Validators.required],
      adoptionGap: ["", Validators.required],
      status: [""],
      date: this.formBuilder.group({
        visitDate: [""],
        startTime: [""],
        endTime: [""],
      }),
      startTime: "00:00",
      endTime: "00:00",
    });
    this.getFarmerGroup();
  }

  getFarmerGroup() {
    this.loading = true;
    this.groupService
      .list({
        reference: "5d1635ac60c3dd116164d4ae",
      })
      .subscribe((data) => {
        this.farmerGroups = data.data;
        console.log(this.farmerGroups);
        this.loading = false;
      });
  }

  open(content) {
    this.modalService.open(content, { ariaLabelledBy: "modal-basic-title" });
  }
}
