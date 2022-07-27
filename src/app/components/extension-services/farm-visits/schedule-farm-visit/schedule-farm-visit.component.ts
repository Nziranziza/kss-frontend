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
    private visitService: VisitService,
    private router: Router,
    private modal: NgbModal,
    private helper: HelperService
  ) {}
  loading: Boolean = false;
  farmerGroups: any[] = [];
  farmList: any[] = [];
  selectedFarm: any[] = [];
  allTraineesSelected: Boolean;
  gaps: any[] = [];
  agronomist: any[] = [];
  farmers: any[] = [];
  gapDropdownSettings: IDropdownSettings = {};
  viewDetailsClicked: Boolean;
  farmDetails;
  farmerGroupId;
  errors: any;
  selectedFarms: any[] = [];

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
        reference: "5d1635ac60c3dd116164d4ae",
      })
      .subscribe((data) => {
        this.farmerGroups = data.data;
        console.log(this.farmerGroups);
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
    console.log(this.scheduleVisit.get("adoptionGap".toString()).value);
  }

  getFarms() {
    let data = {
      name: this.scheduleVisit.value.farmerGroup,
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
      .all(this.authenticationService.getCurrentUser().info.org_id)
      .subscribe((data) => {
        this.agronomist = data.content;
        this.loading = false;
      });
  }

  selectFarms(isChecked: boolean, i: number) {
    this.farmList[i].selected = true;
    if (!isChecked) {
      this.allTraineesSelected = isChecked;
    }
  }

  getGaps(): void {
    this.loading = true;
    this.gapService.all().subscribe((data) => {
      let newData: any[] = [
        {
          _id: "",
          name: "Not Applied",
        },
      ];
      data.data.forEach((data) => {
        newData.push({ _id: data._id, name: data.name });
      });
      this.gaps = newData;
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
    if (this.scheduleVisit.valid) {
      this.selectedFarms = this.farmList.filter((data) => {
        return data.selected == true;
      });
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
        adoptionGap.push(adoption._id);
      });
      const data = {
        farms: this.selectedFarms.map((data) => {
          return {
            farmId: data.farm._id,
            owner: data.owner,
          };
        }),
        gaps: adoptionGap,
        description: dataValues.description,
        org_id: this.authenticationService.getCurrentUser().info.org_id,
        visitor: dataValues.agronomist,
        groupId: this.farmerGroupId,
        observation: "observation",
        date: dataValues.date.visitDate,
        expectedDuration: {
          from: dataValues.startTime,
          to: dataValues.endTime,
        },
      };
      this.visitService.create(data).subscribe(
        (data) => {
          this.loading = false;
          this.router.navigateByUrl("admin/farm/visit/list");
        },
        (err) => {
          this.loading = false;
        }
      );
    } else {
      this.errors = this.helper.getFormValidationErrors(this.scheduleVisit);
    }
  }
  success(name) {
    const modalRef = this.modal.open(SuccessModalComponent, {
      ariaLabelledBy: "modal-basic-title",
    });
    modalRef.componentInstance.message = "has been added";
    modalRef.componentInstance.title = "Thank you Group";
    modalRef.componentInstance.name = name;
    modalRef.result.finally(() => {
      this.router.navigateByUrl("admin/farmers/group/list");
    });
  }
}
