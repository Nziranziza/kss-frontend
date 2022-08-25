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
import { ActivatedRoute, Router } from "@angular/router";
import { SuccessModalComponent } from "src/app/shared";

@Component({
  selector: "app-edit-farm-visit",
  templateUrl: "./edit-farm-visit.component.html",
  styleUrls: [
    "../../schedules/training-scheduling-create/training-scheduling-create.component.css",
  ],
})
export class EditFarmVisitComponent implements OnInit {
  scheduleVisit: FormGroup;
  errors: any;
  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private groupService: GroupService,
    private authenticationService: AuthenticationService,
    private gapService: GapService,
    private userService: UserService,
    private visitService: VisitService,
    private router: Router,
    private route: ActivatedRoute,
    private helper: HelperService,
    private modal: NgbModal
  ) {}
  loading: Boolean = false;
  farmerGroups: any[] = [];
  farmList: any[] = [];
  selectedFarm: any[] = [];
  allTraineesSelected: Boolean;
  gaps: any[] = [];
  agronomist: any[] = [];
  savedFarmList: any[] = [];
  farmers: any[] = [];
  gapDropdownSettings: IDropdownSettings = {};
  viewDetailsClicked: Boolean;
  farmDetails;
  farmerGroupId;
  id: string;
  visits: any[] = [];
  selectedFarms: any[] = [];
  formatedStartDate: string;
  formatedEndDate: string;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.id = params["id".toString()];
    });
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
    this.getVisits();
    this.gapDropdownSettings = {
      singleSelection: false,
      idField: "_id",
      textField: "gap_name",
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
  getVisits() {
    this.visitService.one(this.id).subscribe((data) => {
      this.visits = data.data;
      console.log(this.visits);
      this.savedFarmList = data.data.farms;
      this.scheduleVisit.controls.startTime.setValue(
        data.data.date.split("T")[0] +
          "T" +
          data.data.expectedDuration.from +
          ":00.000Z"
      );
      this.scheduleVisit.controls.endTime.setValue(
        data.data.date.split("T")[0] +
          "T" +
          data.data.expectedDuration.to +
          ":00.000Z"
      );
      this.scheduleVisit.controls.farmerGroup.setValue(
        data.data.groupId.groupName,
        { emitEvent: false }
      );
      this.getFarms(data.data.groupId.groupName);
      this.scheduleVisit.controls.adoptionGap.setValue(data.data.gaps);
      this.scheduleVisit.controls.description.setValue(data.data.description);
      this.scheduleVisit.controls.agronomist.setValue(data.data.visitor.userId);
      this.scheduleVisit.controls.date
        .get("visitDate")
        .setValue(data.data.date);
    });
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

  onGapSelect(item: any) {
    console.log(this.scheduleVisit.get("adoptionGap".toString()).value);
  }
  onDeGapSelect(item: any) {
    let gapSelected = this.scheduleVisit.get("adoptionGap".toString());
    let gapOptions = gapSelected.value.filter((data) => data._id !== item._id);
    gapSelected.setValue(gapOptions, { emitEvent: false });
  }
  onGapSelectAll(items: any) {
    let gapSelected = this.scheduleVisit.get("adoptionGap".toString());
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
        this.savedFarmList.forEach((farms) => {
          member.farms.forEach((farm) => {
            farm.requestInfo.forEach((info) => {
              this.farmList.push({
                farmer: member.firstName
                  ? member.firstName + " " + member.lastName
                  : member.groupContactPersonNames,
                farm: info,
                owner: member.userId,
                upi: info.upiNumber,
                selected: info._id == farms.farmId,
                location: info.location,
                trees: info.numberOfTrees,
              });
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
        console.log(this.agronomist);
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
          gap_name: "Not Applied",
        },
      ];
      data.data.forEach((data) => {
        newData.push({ _id: data._id, gap_name: data.gap_name });
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
    if (this.scheduleVisit.valid) {
      this.selectedFarms = this.selectedFarms.length > 0 ? this.selectedFarms : this.savedFarmList;
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
      let adoptionGap = [];
      dataValues.adoptionGap.forEach((adoption) => {
        if (adoption._id != "") {
          adoptionGap.push(adoption._id);
        }
      });
      let farms = this.farmList.filter((data) => {
        return data.selected == true;
      });
      const data: any = {
        date: dataValues.date.visitDate,
        description: dataValues.description,
        farms: farms.map((data) => {
          return {
            farmId: data.farm._id,
            owner: data.owner,
          };
        }),
        org_id: this.authenticationService.getCurrentUser().info.org_id,
        visitor: dataValues.agronomist,
        groupId: this.farmerGroupId,
        observation: "observation",
        expectedDuration: {
          from: this.formatTime(dataValues.startTime),
          to: this.formatTime(dataValues.endTime),
        },
      };
      if (adoptionGap.length > 0) {
        data.gaps = adoptionGap;
      }
      this.visitService.edit(this.id, data).subscribe(
        (data) => {
          this.loading = false;
          this.success(data.data.description, data.data._id);
        },
        (err) => {
          this.loading = false;
          this.errors = err.errors;
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
    modalRef.componentInstance.message = "has been edited successfully";
    modalRef.componentInstance.title = "Thank you farm visit schedule";
    modalRef.componentInstance.name = name;
    modalRef.componentInstance.messageEnabled = true;
    modalRef.componentInstance.smsId = id;
    modalRef.componentInstance.serviceName = "visit";
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
