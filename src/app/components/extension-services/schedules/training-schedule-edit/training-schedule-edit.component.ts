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
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-training-schedule-edit",
  templateUrl: "./training-schedule-edit.component.html",
  styleUrls: ["./training-schedule-edit.component.css"],
})
export class TrainingScheduleEditComponent
  extends BasicComponent
  implements OnInit {
  scheduleTraining: FormGroup;
  filterForm: FormGroup;
  editContactForm: FormGroup;
  selectedStartDate: string;
  selectedEndDate: string;
  newDate: any;
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
    private router: Router,
    private route: ActivatedRoute
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
  id: string;
  scheduleData: any;

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
    this.newDate.setDate(this.newDate.getDate() - 1);
    this.parameters = {
      length: 10,
      start: 0,
      draw: 1,
      org_id: this.authenticationService.getCurrentUser().info.org_id,
    };
    this.route.params.subscribe((params) => {
      this.id = params["id".toString()];
    });
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
    this.getSchedules();
    this.basicInit(this.authenticationService.getCurrentUser().info.org_id);
    this.onChanges();
    this.addContacts();
    this.getTrainers();
    this.getFarmerGroup();
  }

  getSchedules() {
    this.trainingService.getSchedule(this.id).subscribe((data) => {
      if (data && data.data) {
        this.scheduleData = data.data;
        console.log(this.scheduleData);
        this.scheduleTraining.controls.trainingModule.setValue(
          this.trainings
            .map(function (e) {
              return e._id;
            })
            .indexOf(this.scheduleData.trainingId._id),
          { emitEvent: false }
        );
        this.filterForm.controls.searchByLocation.get("farmerGroup").setValue(this.scheduleData.groupId._id);
        this.scheduleTraining.controls.description.setValue(
          this.scheduleData.description
        );
        this.scheduleTraining.controls.location
          .get("venue".toString())
          .setValue(this.scheduleData.venueName, { emitEvent: false });
        this.scheduleTraining.controls.location
          .get("prov_id".toString())
          .setValue(this.scheduleData.location.prov_id._id);
        this.scheduleTraining.controls.location
          .get("dist_id".toString())
          .setValue(this.scheduleData.location.dist_id._id);
        this.scheduleTraining.controls.location
          .get("sect_id".toString())
          .setValue(this.scheduleData.location.sect_id._id);
        this.scheduleTraining.controls.location
          .get("cell_id".toString())
          .setValue(this.scheduleData.location.cell_id._id);
        this.scheduleTraining.controls.location
          .get("village_id".toString())
          .setValue(this.scheduleData.location.village_id._id);

        this.scheduleTraining.controls.trainer.setValue(
          this.trainers
            .map(function (e) {
              return e._id;
            })
            .indexOf(this.scheduleData.trainer.userId)
        );
        this.scheduleTraining.controls.startTime.setValue(
          new Date(this.scheduleData.startTime)
        );
        this.scheduleTraining.controls.endTime.setValue(
          new Date(this.scheduleData.endTime)
        );
        this.scheduleTraining.controls.trainingStartDate.setValue(
          this.scheduleData.startTime
        );
        this.scheduleTraining.controls.trainingEndDate.setValue(
          this.scheduleData.endTime
        );
        this.scheduleData.trainees.map((trainee) => {
          let data = {
            name: trainee.foreName + " " + trainee.surName,
            firstName: trainee.foreName,
            lastName: trainee.surName,
            userId: trainee.userId,
            phoneNumber: trainee.phoneNumber,
            contact: trainee.phoneNumber,
            attendance: trainee.attended ? "attended" : "not attended",
            groupId: trainee.groupId,
            selected: true,
          };
          this.selectedTrainees.push(data);
        });
      }
    });
  }

  addContacts() {
    const departmentControl = (
      this.editContactForm.get("contacts") as FormArray
    ).controls;
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
      .allAgronomist({
        org_id: this.authenticationService.getCurrentUser().info.org_id,
      })
      .subscribe((data) => {
        this.trainers = data.data;
        this.loading = false;
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
        this.trainees = data.data
          .filter((element) => {
            return element.attendance !== "attended";
          })
          .map((item) => {
            if (item.phoneNumber) {
              if (item.phoneNumber.length > 9) {
                item.selected = true;
              }
            }
            return item;
          });
        this.addContacts();
        this.loading = false;
      });
  }

  open(content) {
    this.scheduleTraining.markAllAsTouched();
    if (this.scheduleTraining.valid) {
      this.selectedStartDate =
        this.formatDate(
          new Date(this.scheduleTraining.controls.trainingStartDate.value)
            .toISOString()
            .split("T")[0]
        ) +
        " " +
        this.formatTime(this.scheduleTraining.value.startTime);
      this.selectedEndDate =
        this.formatDate(
          new Date(this.scheduleTraining.controls.trainingEndDate.value)
            .toISOString()
            .split("T")[0]
        ) +
        " " +
        this.formatTime(this.scheduleTraining.value.endTime);
      this.modalService.open(content);
    } else {
      this.errors = this.helper.getFormValidationErrors(this.scheduleTraining);
    }
  }

  addContact(index) {
    this.trainees[index].editMode = true;
  }

  cancelEditContact(index) {
    this.trainees[index].editMode = false;
  }

  submitContact(index) {
    if (this.editContactForm.valid) {
      const arrayControl = this.editContactForm.get("contacts") as FormArray;
      const traineData = arrayControl.at(index);
      this.trainees[index].contact = traineData.value.contact;
      this.trainees[index].phoneNumber = traineData.value.contact;
      this.trainees[index].editMode = false;
      const data = {
        userId: traineData.value.userId,
        phoneNumber: traineData.value.contact.toString(),
        lastModifiedBy: {
          _id: this.authenticationService.getCurrentUser().info._id,
          name: this.authenticationService.getCurrentUser().info.surname,
        },
      };
      console.log(data);
      this.userService
        .updateMemberContact(traineData.value.groupId, data)
        .subscribe((data) => {
          this.loading = false;
          console.log(data);
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editContactForm);
    }
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
    if (this.trainees[i].contact?.length > 9) {
      this.trainees[i].selected = true;
      this.trainees[i].groupId = this.filterForm.controls.searchByLocation.get(
        "farmerGroup".toString()
      ).value;
      if (!isChecked) {
        this.allTraineesSelected = isChecked;
      }
    }
  }

  addSelectedToBeTrained() {
    this.trainees
      .filter((itemData) => itemData.selected)
      .map((itemData) => {
        if (
          !this.selectedTrainees.find((item) => item.userId === itemData.userId)
        ) {
          itemData.selected = false;
          this.selectedTrainees.push(itemData);
        }
      });
  }

  removeMembersToBeTrained() {
    this.selectedTrainees.forEach((item) => {
      if (item.selected) {
        this.selectedTrainees = this.selectedTrainees.filter(
          (el) => el.userId != item.userId
        );
        item.selected = false;
      }
    });
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
  }

  onSubmit() {
    this.loading = true;
    const data = {
      _id: this.id,
      trainingId:
        this.trainings[this.scheduleTraining.value.trainingModule]._id,
      trainer: {
        userId: this.trainers[this.scheduleTraining.value.trainer]._id,
        fullName:
          this.trainers[this.scheduleTraining.value.trainer].fullNames,
        phoneNumber:
          this.trainers[this.scheduleTraining.value.trainer].phoneNumber,
        organisationName:
          this.authenticationService.getCurrentUser().orgInfo.orgName,
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
        this.formatDate(this.scheduleTraining.value.trainingStartDate) +
        "T" +
        this.formatTime(this.scheduleTraining.value.startTime),
      endTime:
        this.formatDate(this.scheduleTraining.value.trainingEndDate) +
        "T" +
        this.formatTime(this.scheduleTraining.value.endTime),
      referenceId: this.authenticationService.getCurrentUser().info.org_id,
      trainees: this.selectedTrainees.map((item) => {
        return {
          userId: item.userId,
          groupId: item.groupId,
        };
      }),
    };
    this.trainingService.editSchedule(data, this.id).subscribe((data) => {
      this.successDatails = data.data;
      this.loading = false;
    });
  }

  sendMessage() {
    this.loading = true;
    const data = this.successDatails._id;
    this.trainingService.sendMessage(data).subscribe((data) => {
      this.router.navigateByUrl("admin/training/schedule/list");
      this.loading = false;
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
    var hours = date.getHours();
    var minutes = date.getMinutes();
    hours = hours % 24;
    hours = hours ? hours : 24; // the hour '0' should be '24'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes;
    return strTime;
  }
}
