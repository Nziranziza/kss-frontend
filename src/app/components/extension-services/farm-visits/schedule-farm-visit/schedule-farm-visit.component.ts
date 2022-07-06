import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthenticationService, GapService, GroupService, UserService } from "src/app/core";
@Component({
  selector: "app-schedule-farm-visit",
  templateUrl: "./schedule-farm-visit.component.html",
  styleUrls: [
    "../../schedules/training-scheduling-create/training-scheduling-create.component.css",
  ],
})
export class ScheduleFarmVisitComponent implements OnInit {
  scheduleVisit: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private groupService: GroupService,
    private authenticationService: AuthenticationService, 
    private gapService: GapService,
    private userService: UserService,
  ) {}
  loading: Boolean = false;
  farmerGroups: any[] = [];
  farmList: any[] = [];
  selectedFarm: any[] = [];
  allTraineesSelected: Boolean;
  gaps: any[] = [];
  agronomist: any[] = [];

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
    this.getGaps();
    this.getAgronomists();
    this.onChanges();
  }

  getFarmerGroup() {
    this.loading = true;
    console.log(this.authenticationService.getCurrentUser());
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

  getFarms() {
    let data = {
      name: this.scheduleVisit.value.farmerGroup,
      org_id: this.authenticationService.getCurrentUser().info.org_id,
    };
    this.groupService.getByName(data).subscribe((data) => {
      console.log(data);
      data.data.members.forEach((member) => {
        member.farms.forEach((farm) => {
          farm.requestInfo.forEach((info) => {
            this.farmList.push({
              farmer : member.firstName ? member.firstName + " " + member.lastName : member.groupContactPersonNames,
              farm: farm,
              owner: member.userId,
              upi: info.upiNumber,
              selected: false
            });
          })
        })
      })
    });
  }

  getAgronomists() {
    this.loading = true;
    this.userService
      .all(this.authenticationService.getCurrentUser().info.org_id)
      .subscribe((data) => {
        this.agronomist = data.content;
        this.loading = false;
      });
  }

  selectTrainee(isChecked: boolean, i: number) {
    this.farmList[i].selected = true;
    if (!isChecked) {
      this.allTraineesSelected = isChecked;
    }
  }

  getGaps(): void {
    this.loading = true;
    this.gapService.all().subscribe((data) => {
      this.gaps = data.data;
      this.loading = false;
    });
  }

  onChanges() {
    this.scheduleVisit
      .get("farmerGroup".toString())
      .valueChanges.subscribe((value) => {
        this.getFarms();
      });
  }

  open(content) {
    this.modalService.open(content, { ariaLabelledBy: "modal-basic-title" });
  }
}
