import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  TrainingService,
  Training,
  BasicComponent,
  LocationService,
  HelperService,
  AuthenticationService,
  OrganisationService,
  UserService,
  GroupService,
  User,
} from "../../../../core";
import { isEmptyObject } from "jquery";
import { Router } from "@angular/router";

@Component({
  selector: "app-training-scheduling-create",
  templateUrl: "./training-scheduling-create.component.html",
  styleUrls: ["./training-scheduling-create.component.css"],
})
export class TrainingSchedulingCreateComponent
  extends BasicComponent
  implements OnInit
{
  scheduleTraining: FormGroup;
  filterForm: FormGroup;
  editContactForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private trainingService: TrainingService,
    protected locationService: LocationService,
    private helper: HelperService,
    private authenticationService: AuthenticationService,
    private modal: NgbModal,
    private organisationService: OrganisationService,
    private userService: UserService,
    private groupService: GroupService,
    private router: Router
  ) {
    super(locationService, organisationService);
  }
  today: any = new Date();
  trainings: Training[] = [];
  allTraineesSelected: boolean;
  trainees: any[] = [];
  selectedTrainees: any[] = [];
  searchByLocation = true;
  parameters: any;
  errors: any;
  provinces: any;
  loading = false;
  org: any;
  searchResults: any;
  trainers: any[] = [];
  farmers: any[] = [];
  farmerGroups: any[] = [];
  successDatails;

  ngOnInit() {
    this.getGroups();
    this.scheduleTraining = this.formBuilder.group({
      trainingModule: ["", Validators.required],
      trainer: ["", Validators.required],
      description: [""],
      location: this.formBuilder.group({
        prov_id: [""],
        dist_id: [""],
        sect_id: [""],
        cell_id: [""],
        village_id: [""],
        venue: [""],
      }),
      trainingStartDate: [""],
      trainingEndDate: [""],
      startTime: [""],
      endTime: [""],
    });
    this.parameters = {
      length: 10,
      start: 0,
      draw: 1,
      org_id: this.authenticationService.getCurrentUser().info.org_id,
    };
    this.editContactForm = this.formBuilder.group({
      contacts: this.formBuilder.array([]),
    });
    this.filterForm = this.formBuilder.group({
      searchOption: ["location"],
      searchByLocation: this.formBuilder.group({
        searchBy: ["farmer_location"],
        sect_id: [""],
        cell_id: [""],
        village_id: [""],
        farmerGroup: [""],
      }),
      searchByTerm: this.formBuilder.group({
        term: ["", Validators.minLength(3)],
        searchBy: ["reg_number"],
      }),
    });
    this.basicInit(this.authenticationService.getCurrentUser().info.org_id);
    this.onChanges();
    this.addContacts();
    this.getTrainers();
    this.getFarmerGroup();
  }
  addContacts() {
    let departmentControl = (this.editContactForm.get("contacts") as FormArray)
      .controls;
    this.trainees.forEach((trainee) => {
      departmentControl.push(
        this.formBuilder.group({
          name: trainee.name,
          userId: trainee.userId,
          contact: trainee.phoneNumber,
          groupId: trainee.groupId,
        })
      );
    });
  }

  getGroups(): void {
    this.loading = true;
    this.trainingService.all().subscribe((data) => {
      this.trainings = data.data;
      this.loading = false;
    });
  }
  getTrainers() {
    this.loading = true;
    this.userService
      .all(this.authenticationService.getCurrentUser().info.org_id)
      .subscribe((data) => {
        this.trainers = data.content;
        this.loading = false;
      });
  }

  getFarmerGroup() {
    this.loading = true;
    this.groupService
      .list({
        reference: "5d1635ac60c3dd116164d4ae",
      })
      .subscribe((data) => {
        this.farmerGroups = data.data;
        this.loading = false;
      });
  }

  getFarmers() {
    this.loading = true;
    this.trainingService
      .getFarmersByGroup(
        this.filterForm.controls.searchByLocation.get("farmerGroup".toString())
          .value,
        {
          trainingId:
            this.trainings[this.scheduleTraining.value.trainingModule]._id,
        }
      )
      .subscribe((data) => {
        this.trainees = data.data;
        this.addContacts();
        this.loading = false;
      });
  }

  open(content) {
    this.modalService.open(content, { size: "lg", windowClass: "modal-lg" });
  }

  addContact(index) {
    this.trainees[index].editMode = true;
  }
  cancelEditContact(index) {
    this.trainees[index].editMode = false;
  }
  submitContact(index) {
    let arrayControl = this.editContactForm.get("contacts") as FormArray;
    let traineData = arrayControl.at(index);
    this.trainees[index].contact = traineData.value.contact;
    this.trainees[index].phoneNumber = traineData.value.contact;
    this.trainees[index].editMode = false;
    let data = {
      userId: traineData.value.userId,
      phoneNumber: traineData.value.contact.toString(),
      lastModifiedBy: {
        _id: this.authenticationService.getCurrentUser().info._id,
        name: this.authenticationService.getCurrentUser().info.surname,
      },
    };
    this.userService
      .updateMemberContact(traineData.value.groupId, data)
      .subscribe((data) => {
        console.log(data);
        this.loading = false;
      });
    this.getFarmers();
  }

  onFilter() {
    if (this.filterForm.valid) {
      this.loading = true;
      const filter = JSON.parse(JSON.stringify(this.filterForm.value));
      delete filter.searchOption;
      if (filter.searchByTerm.term === "") {
        delete filter.searchByTerm;
      }
      const location = filter.searchByLocation;
      if (location) {
        if (location.village_id !== "") {
          filter.searchByLocation.filterBy = "village";
          filter.searchByLocation.village_id = location.village_id;
        } else if (location.cell_id !== "") {
          filter.searchByLocation.filterBy = "cell";
          filter.searchByLocation.cell_id = location.cell_id;
        } else if (location.sect_id !== "") {
          filter.searchByLocation.filterBy = "sector";
          filter.searchByLocation.sect_id = location.sect_id;
        } else {
          delete filter.searchByLocation;
        }
      }
      this.helper.cleanObject(filter.searchByLocation);

      if (!isEmptyObject(filter)) {
        this.parameters["search".toString()] = filter;
      } else {
        delete this.parameters.search;
      }
    }
  }

  selectAllTrainee(isChecked: boolean) {
    if (isChecked) {
      this.trainees.forEach((item) => {
        item.selected = true;
      });
    } else {
      this.trainees.forEach((item) => {
        item.selected = false;
      });
    }
    this.allTraineesSelected = isChecked;
  }

  selectTrainee(isChecked: boolean, i: number) {
    this.trainees[i].selected = true;
    this.trainees[i].groupId = this.filterForm.controls.searchByLocation.get(
      "farmerGroup".toString()
    ).value;
    if (!isChecked) {
      this.allTraineesSelected = isChecked;
    }
  }

  addSelectedToBeTrained() {
     this.trainees.filter((item) => item.selected).map((item) => this.selectedTrainees.push(item));
  }

  onChanges() {
    this.scheduleTraining.controls.location
      .get("prov_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangeProvince(this.scheduleTraining, value);
      });
    this.scheduleTraining.controls.location
      .get("dist_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangDistrict(this.scheduleTraining, value);
      });
    this.scheduleTraining.controls.location
      .get("sect_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangSector(this.scheduleTraining, value);
      });
    this.scheduleTraining.controls.location
      .get("cell_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangCell(this.scheduleTraining, value);
      });
    this.filterForm.controls.searchByLocation
      .get("sect_id".toString())
      .valueChanges.subscribe((value) => {
        if (value !== "") {
          this.locationService.getCells(value).subscribe((data) => {
            this.basicCoveredCells = this.filterZoningCells(
              this.basicOrg.coveredSectors,
              value
            );
            this.basicCoveredVillages = null;
            this.filterForm.controls.searchByLocation
              .get("village_id".toString())
              .setValue("", { emitEvent: false });
          });
        } else {
          this.basicCoveredCells = null;
          this.basicCoveredVillages = null;
          this.filterForm.controls.searchByLocation
            .get("cell_id".toString())
            .setValue("", { emitEvent: false });
          this.filterForm.controls.searchByLocation
            .get("village_id".toString())
            .setValue("", { emitEvent: false });
        }
      });
    this.filterForm.controls.searchByLocation
      .get("cell_id".toString())
      .valueChanges.subscribe((value) => {
        if (value !== "") {
          this.locationService.getVillages(value).subscribe((data) => {
            const id = this.filterForm.controls.searchByLocation.get(
              "sect_id".toString()
            ).value;
            this.basicCoveredVillages = this.filterZoningVillages(
              this.basicOrg.coveredSectors,
              id,
              data
            );
            this.filterForm.controls.searchByLocation
              .get("village_id".toString())
              .setValue("", { emitEvent: false });
          });
        }
      });

    this.filterForm.controls.searchByLocation
      .get("farmerGroup".toString())
      .valueChanges.subscribe((value) => {
        if (value !== "") {
          this.getFarmers();
        }
      });
    this.scheduleTraining
      .get("trainingStartDate".toString())
      .valueChanges.subscribe((value) => {
        if (value !== "") {
          this.scheduleTraining
            .get("trainingStartDate".toString())
            .setValue(new Date(value).toISOString().split("T")[0], {
              emitEvent: false,
            });
        }
      });

    this.scheduleTraining
      .get("trainingEndDate".toString())
      .valueChanges.subscribe((value) => {
        if (value !== "") {
          this.scheduleTraining
            .get("trainingEndDate".toString())
            .setValue(new Date(value).toISOString().split("T")[0], {
              emitEvent: false,
            });
        }
      });
  }

  onSubmit() {
    this.loading = true;
    const data = {
      trainingId:
        this.trainings[this.scheduleTraining.value.trainingModule]._id,
      trainer: {
        userId: this.trainers[this.scheduleTraining.value.trainer]._id,
        fullName:
          this.trainers[this.scheduleTraining.value.trainer].foreName +
          " " +
          this.trainers[this.scheduleTraining.value.trainer].surname,
        phoneNumber:
          this.trainers[this.scheduleTraining.value.trainer].phoneNumber,
        organisationName: this.authenticationService.getCurrentUser().orgInfo.orgName,
      },
      groupId: this.filterForm.controls.searchByLocation.get(
        "farmerGroup".toString()
      ).value,
      description: this.scheduleTraining.value.description,
      location: {
        prov_id: this.scheduleTraining.value.location.prov_id,
        dist_id: this.scheduleTraining.value.location.dist_id,
        sect_id: this.scheduleTraining.value.location.sect_id,
        cell_id: this.scheduleTraining.value.location.cell_id,
        village_id: this.scheduleTraining.value.location.village_id,
      },
      venueName: this.scheduleTraining.value.location.venue,
      startTime:
        this.scheduleTraining.value.trainingStartDate +
        "T" +
        this.scheduleTraining.value.startTime,
      endTime:
        this.scheduleTraining.value.trainingEndDate +
        "T" +
        this.scheduleTraining.value.endTime,
      referenceId: "5d1635ac60c3dd116164d4ae",
      trainees: this.selectedTrainees.map((item) => {
        return {
          userId: item.userId,
          groupId: item.groupId,
        };
      }),
    };
    this.trainingService.scheduleTraining(data).subscribe((data) => {
      this.successDatails = data.data;
      this.loading = false;
    });
  }

  sendMessage() {
    this.loading = true;
    console.log(this.successDatails);
    let data = this.successDatails._id;
    console.log(data);
    this.trainingService.sendMessage(data).subscribe((data) => {
      this.router.navigateByUrl("admin/training/schedule/list");
      this.loading = false;
    });
  }
}
