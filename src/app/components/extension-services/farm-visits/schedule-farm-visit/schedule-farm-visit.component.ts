import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  AuthenticationService,
  GapService,
  GroupService,
  HelperService,
  UserService,
  VisitService,
} from "src/app/core";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { Router } from "@angular/router";
import { SuccessModalComponent } from "../../../../shared";
import { ScrollStrategy, ScrollStrategyOptions } from "@angular/cdk/overlay";
@Component({
  selector: "app-schedule-farm-visit",
  templateUrl: "./schedule-farm-visit.component.html",
  styleUrls: [
    "../../schedules/training-scheduling-create/training-scheduling-create.component.css",
  ],
})
export class ScheduleFarmVisitComponent implements OnInit {
  scheduleVisit: FormGroup;
  scrollStrategy: ScrollStrategy;
  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private groupService: GroupService,
    private authenticationService: AuthenticationService,
    private gapService: GapService,
    private userService: UserService,
    private visitService: VisitService,
    private router: Router,
    private modal: NgbModal,
    private helper: HelperService,
    private readonly sso: ScrollStrategyOptions
  ) {
    this.scrollStrategy = this.sso.noop();
  }
  loading = false;
  farmerGroups: any[] = [];
  farmList: any[] = [];
  selectedFarm: any[] = [];
  allTraineesSelected: boolean;
  gaps: any[] = [];
  agronomist: any[] = [];
  farmers: any[] = [];
  gapDropdownSettings: IDropdownSettings = {};
  viewDetailsClicked: boolean;
  farmDetails;
  farmerGroupId;
  errors: any;
  selectedFarms: any[] = [];
  formatedStartDate: string;
  formatedEndDate: string;

  ngOnInit() {
    this.scheduleVisit = this.formBuilder.group({
      farmerGroup: ["", Validators.required],
      agronomist: ["", Validators.required],
      description: ["", Validators.required],
      adoptionGap: ["", Validators.required],
      status: [""],
      date: this.formBuilder.group({
        visitDate: ["", Validators.required],
      }),
      startTime: ["", Validators.required],
      endTime: ["", Validators.required],
    });

    this.gapDropdownSettings = {
      singleSelection: false,
      idField: "_id",
      textField: "name",
      enableCheckAll: false,
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      itemsShowLimit: 6,
      allowSearchFilter: true,
    };
    this.getFarmerGroup();
    this.getGaps();
    this.getAgronomists();
    this.onChanges();
  }

  getFarmerGroup() {
    this.loading = true;
    this.groupService
      .list({
        reference: this.authenticationService.getCurrentUser().info.org_id,
      })
      .subscribe((data) => {
        this.farmerGroups = data.data;
        this.loading = false;
      });
  }

  onGapSelect(item: any) {}
  onDeGapSelect(item: any) {
    const gapSelected = this.scheduleVisit.get("adoptionGap".toString());
    const gapOptions = gapSelected.value.filter(
      (data) => data._id !== item._id
    );
    gapSelected.setValue(gapOptions, { emitEvent: false });
  }
  onGapSelectAll(items: any) {
    const gapSelected = this.scheduleVisit.get("adoptionGap".toString());
    gapSelected.setValue(items, { emitEvent: false });
  }

  getFarms(groupName: string) {
    const data = {
      name: groupName,
      org_id: this.authenticationService.getCurrentUser().info.org_id,
    };
    this.farmList = [];
    this.farmers = [];
    this.groupService.getByName(data).subscribe((data) => {
      this.farmerGroupId = data.data._id;
      data.data.members.forEach((member) => {
        member.openDialog = false;
        this.farmers.push(member);
        member.farms.forEach((farm) => {
          farm.requestInfo.forEach((info) => {
            this.farmList.push({
              farmer: member.firstName
                ? member.firstName + " " + member.lastName
                : member.groupContactPersonNames,
              farm: info,
              owner: member.userId,
              upi: info.upiNumber,
              location: info.location,
              trees: info.numberOfTrees,
              selected: false,
            });
          });
        });
      });
    });
  }

  expandFarmModal(i: number) {
    this.farmers[i].openDialog = !this.farmers[i].openDialog;
  }

  viewDetails(i: number) {
    this.farmDetails = this.farmList[i].farm;
    this.viewDetailsClicked = true;
  }

  getAgronomists() {
    this.loading = true;
    this.userService
      .allAgronomist({
        org_id: this.authenticationService.getCurrentUser().info.org_id,
      })
      .subscribe((data) => {
        this.agronomist = data.data;
        this.loading = false;
      });
  }

  selectFarms(isChecked: boolean, i: number) {
    this.farmList[i].selected = true;
    if (!isChecked) {
      this.allTraineesSelected = isChecked;
    }
    this.selectedFarms = this.farmList.filter((data) => {
      return data.selected === true;
    });
  }

  getGaps(): void {
    this.loading = true;
    this.gapService.all().subscribe((data) => {
      const newData: any[] = [
        {
          _id: "",
          name: "Not Applied",
        },
      ];
      data.data.forEach((data) => {
        newData.push({ _id: data._id, name: data.gap_name });
      });
      this.gaps = newData;
      this.loading = false;
    });
  }

  onChanges() {
    this.scheduleVisit
      .get("farmerGroup".toString())
      .valueChanges.subscribe((value) => {
        this.getFarms(value);
      });
  }

  open(content) {
    this.scheduleVisit.markAllAsTouched();
    if (this.scheduleVisit.valid && this.selectedFarms.length > 0) {
      this.formatedStartDate =
        this.formatDate(
          this.scheduleVisit.controls.date.get("visitDate".toString()).value
        ).split("T")[0] +
        " " +
        this.formatTime(this.scheduleVisit.get("startTime".toString()).value);
      this.formatedEndDate =
        this.formatDate(
          this.scheduleVisit.controls.date.get("visitDate".toString()).value
        ).split("T")[0] +
        " " +
        this.formatTime(this.scheduleVisit.get("endTime".toString()).value);
      this.modalService.open(content, { ariaLabelledBy: "modal-basic-title" });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.scheduleVisit);
    }
  }

  onSubmit() {
    if (this.scheduleVisit.valid) {
      this.loading = true;
      const dataValues = JSON.parse(JSON.stringify(this.scheduleVisit.value));
      const adoptionGap = [];
      dataValues.adoptionGap.forEach((adoption) => {
        if (adoption._id != "") {
          adoptionGap.push(adoption._id);
        }
      });
      let data: any = {
        farms: this.selectedFarms.map((data) => {
          return {
            farmId: data.farm._id,
            owner: data.owner,
          };
        }),
        description: dataValues.description,
        org_id: this.authenticationService.getCurrentUser().info.org_id,
        visitor: dataValues.agronomist,
        groupId: this.farmerGroupId,
        observation: "observation",
        date: dataValues.date.visitDate,
        expectedDuration: {
          from: this.formatTime(dataValues.startTime),
          to: this.formatTime(dataValues.endTime),
        },
      };
      if (adoptionGap.length > 0) {
        data.gaps = adoptionGap;
      }
      this.visitService.create(data).subscribe(
        (data) => {
          this.success(data.data.description, data.data._id);
        },
        (err) => {
          this.error("farm visit");
          this.loading = false;
        }
      );
    } else {
      this.errors = this.helper.getFormValidationErrors(this.scheduleVisit);
    }
  }

  success(name, id) {
    const modalRef = this.modal.open(SuccessModalComponent, {
      ariaLabelledBy: "modal-basic-title",
    });
    modalRef.componentInstance.message = "has been added";
    modalRef.componentInstance.title = "Thank you farm visit schedule";
    modalRef.componentInstance.name = name;
    modalRef.componentInstance.messageEnabled = true;
    modalRef.componentInstance.smsId = id;
    modalRef.componentInstance.serviceName = "visit";
    modalRef.result.finally(() => {
      this.router.navigateByUrl("admin/farm/visit/list");
    });
  }

  error(name) {
    const modalRef = this.modal.open(SuccessModalComponent, {
      ariaLabelledBy: "modal-basic-title",
    });
    modalRef.componentInstance.message = "failed to be scheduled";
    modalRef.componentInstance.title =
      "check the information again and try again";
    modalRef.componentInstance.name = name;
    modalRef.result.finally(() => {
      this.router.navigateByUrl("admin/farm/visit/list");
    });
  }

  formatDate(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }

  formatTime(date) {
    let currentDate = new Date(date);
    var hours = currentDate.getHours();
    var minutes = currentDate.getMinutes();
    hours = hours % 24;
    hours = hours ? hours : 24; // the hour '0' should be '12'
    minutes = minutes < 10 ? 0 + minutes : minutes;
    var strTime = hours + ":" + minutes;
    return strTime;
  }
}
