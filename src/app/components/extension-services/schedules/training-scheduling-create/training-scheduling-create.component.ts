import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
} from '../../../../core';
import { isEmptyObject } from 'jquery';
import { Router } from '@angular/router';
import { SuccessModalComponent } from 'src/app/shared';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';

@Component({
  selector: 'app-training-scheduling-create',
  templateUrl: './training-scheduling-create.component.html',
  styleUrls: ['./training-scheduling-create.component.css'],
})
export class TrainingSchedulingCreateComponent
  extends BasicComponent
  implements OnInit {
  scheduleTraining: FormGroup;
  filterForm: FormGroup;
  editContactForm: FormGroup;
  newDate: Date = new Date();
  scrollStrategy: ScrollStrategy;
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
    private readonly sso: ScrollStrategyOptions
  ) {
    super(locationService, organisationService);
    this.scrollStrategy = this.sso.noop();
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
  selectedStartDate: any;
  selectedEndDate: any;
  sectors: any[] = [];
  districts: any[] = [];

  ngOnInit() {
    this.getTrainings();
    this.scheduleTraining = this.formBuilder.group({
      trainingModule: ['', Validators.required],
      trainer: ['', Validators.required],
      description: ['', Validators.required],
      location: this.formBuilder.group({
        prov_id: [{ value: '', disabled: true }],
        dist_id: [{ value: '', disabled: true }],
        sect_id: ['', Validators.required],
        cell_id: ['', Validators.required],
        village_id: ['', Validators.required],
        venue: ['', Validators.required],
      }),
      trainingStartDate: ['', Validators.required],
      trainingEndDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
    });
    this.newDate.setDate(this.newDate.getDate() - 1);
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
      searchOption: ['location'],
      searchByLocation: this.formBuilder.group({
        searchBy: ['farmer_location'],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
        farmerGroup: [''],
      }),
      searchByTerm: this.formBuilder.group({
        term: ['', Validators.minLength(3)],
        searchBy: ['reg_number'],
      }),
    });
    this.organisationService.get(this.authenticationService.getCurrentUser().info.org_id).subscribe((data) => {
      this.org = data.content;
      this.initial();
    });
    this.basicInit(this.authenticationService.getCurrentUser().info.org_id);
    this.onChanges();
    this.addContacts();
    this.getTrainers();
    this.getFarmerGroup({ reference: this.authenticationService.getCurrentUser().info.org_id });
    this.initial();
  }

  addContacts() {
    const departmentControl = (
      this.editContactForm.get('contacts') as FormArray
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

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
      this.locationService
        .getDistricts(this.org.location.prov_id._id)
        .subscribe((dt) => {
          this.districts = dt;
          this.scheduleTraining.controls.location
            .get('prov_id'.toString())
            .patchValue(this.org.location.prov_id._id, { emitEvent: true })
          this.scheduleTraining.controls.location
            .get('dist_id'.toString())
            .patchValue(this.org.location.dist_id._id, { emitEvent: true });
          this.sectors = this.filterZoningSectors(this.org.coveredSectors);
        });
    });
  }

  getTrainings(): void {
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

  getFarmerGroup(body: any) {
    this.loading = true;
    this.groupService
      .all(body)
      .subscribe((data) => {
        this.farmerGroups = data.data;
        this.loading = false;
      });
  }

  getFarmers() {
    this.loading = true;
    this.trainingService
      .getFarmersByGroup(
        this.filterForm.controls.searchByLocation.get('farmerGroup'.toString())
          .value,
        {
          trainingId:
            this.trainings[this.scheduleTraining.value.trainingModule]._id,
        }
      )
      .subscribe((data) => {
        this.trainees = data.data
          .filter((element) => {
            return element.attendance !== 'attended';
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
          new Date(this.scheduleTraining.controls.trainingStartDate.value).toLocaleDateString('pt-br').split('/').reverse().join('-')
        ) +
        ' ' +
        this.formatTime(this.scheduleTraining.value.startTime);
      this.selectedEndDate =
        this.formatDate(
          new Date(this.scheduleTraining.controls.trainingEndDate.value)
            .toLocaleDateString('pt-br').split('/').reverse().join('-')
        ) +
        ' ' +
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
      const arrayControl = this.editContactForm.get('contacts') as FormArray;
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
      this.userService
        .updateMemberContact(traineData.value.groupId, data)
        .subscribe((newdata) => {
          this.loading = false;
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
      if (filter.searchByTerm.term === '') {
        delete filter.searchByTerm;
      }
      const location = filter.searchByLocation;
      if (location) {
        if (location.village_id !== '') {
          filter.searchByLocation.filterBy = 'village';
          filter.searchByLocation.village_id = location.village_id;
        } else if (location.cell_id !== '') {
          filter.searchByLocation.filterBy = 'cell';
          filter.searchByLocation.cell_id = location.cell_id;
        } else if (location.sect_id !== '') {
          filter.searchByLocation.filterBy = 'sector';
          filter.searchByLocation.sect_id = location.sect_id;
        } else {
          delete filter.searchByLocation;
        }
      }
      this.helper.cleanObject(filter.searchByLocation);

      if (!isEmptyObject(filter)) {
        this.parameters['search'.toString()] = filter;
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
        'farmerGroup'.toString()
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
          (el) => el.userId !== item.userId
        );
        item.selected = false;
      }
    });
  }

  onChanges() {
    const body: any = {
      reference: this.authenticationService.getCurrentUser().info.org_id
    }
    this.scheduleTraining.controls.location
      .get('sect_id'.toString())
      .valueChanges.subscribe((value) => {
        this.locationChangSector(this.scheduleTraining, value);
      });
    this.scheduleTraining.controls.location
      .get('cell_id'.toString())
      .valueChanges.subscribe((value) => {
        this.locationChangCell(this.scheduleTraining, value);
      });
    this.filterForm.controls.searchByLocation
      .get('sect_id'.toString())
      .valueChanges.subscribe((value) => {
        if (value !== '') {
          body.location = {
            sect_id: value,
          }
          this.locationService.getCells(value).subscribe((data) => {
            this.basicCoveredCells = this.filterZoningCells(
              this.basicOrg.coveredSectors,
              value
            );
            this.basicCoveredVillages = null;
            this.filterForm.controls.searchByLocation
              .get('village_id'.toString())
              .setValue('', { emitEvent: false });
          });
        } else {
          this.basicCoveredCells = null;
          this.basicCoveredVillages = null;
          this.filterForm.controls.searchByLocation
            .get('cell_id'.toString())
            .setValue('', { emitEvent: false });
          this.filterForm.controls.searchByLocation
            .get('village_id'.toString())
            .setValue('', { emitEvent: false });
        }
        this.getFarmerGroup(body);
      });
    this.filterForm.controls.searchByLocation
      .get('cell_id'.toString())
      .valueChanges.subscribe((value) => {
        if (value !== '') {
          body.location = {
            cell_id: value,
          }
          this.locationService.getVillages(value).subscribe((data) => {
            const id = this.filterForm.controls.searchByLocation.get(
              'sect_id'.toString()
            ).value;
            this.basicCoveredVillages = this.filterZoningVillages(
              this.basicOrg.coveredSectors,
              id,
              data
            );
            this.filterForm.controls.searchByLocation
              .get('village_id'.toString())
              .setValue('', { emitEvent: false });
          });
        } else {
          body.location = {
            sect_id: this.filterForm.controls.searchByLocation
              .get('sect_id'.toString()).value,
          }
        }
        this.getFarmerGroup(body);
      });

    this.filterForm.controls.searchByLocation
      .get('village_id'.toString())
      .valueChanges.subscribe((value) => {
        if (value !== '') {
          body.location = {
            village_id: value,
          }
        } else {
          body.location = {
            cell_id: this.filterForm.controls.searchByLocation
              .get('cell_id'.toString()).value,
          }
        }
        this.getFarmerGroup(body);
      });

    this.filterForm.controls.searchByLocation
      .get('farmerGroup'.toString())
      .valueChanges.subscribe((value) => {
        if (value !== '') {
          this.getFarmers();
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
          this.trainers[this.scheduleTraining.value.trainer].fullNames,
        phoneNumber:
          this.trainers[this.scheduleTraining.value.trainer].phoneNumber,
        organisationName:
          this.authenticationService.getCurrentUser().orgInfo.orgName,
      },
      groupId: this.filterForm.controls.searchByLocation.get(
        'farmerGroup'.toString()
      ).value,
      description: this.scheduleTraining.value.description,
      location: {
        prov_id: this.org.location.prov_id._id,
        dist_id: this.org.location.dist_id._id,
        sect_id: this.scheduleTraining.value.location.sect_id,
        cell_id: this.scheduleTraining.value.location.cell_id,
        village_id: this.scheduleTraining.value.location.village_id,
      },
      venueName: this.scheduleTraining.value.location.venue,
      startTime:
        this.formatDate(
          new Date(this.scheduleTraining.controls.trainingStartDate.value)
            .toLocaleDateString('pt-br').split('/').reverse().join('-')
        ) +
        'T' +
        this.formatTime(this.scheduleTraining.value.startTime),
      endTime:
        this.formatDate(
          new Date(this.scheduleTraining.controls.trainingEndDate.value)
            .toLocaleDateString('pt-br').split('/').reverse().join('-')
        ) +
        'T' +
        this.formatTime(this.scheduleTraining.value.endTime),
      referenceId: this.authenticationService.getCurrentUser().info.org_id,
      trainees: this.selectedTrainees.map((item) => {
        return {
          userId: item.userId,
          groupId: item.groupId,
        };
      }),
    };
    this.trainingService.scheduleTraining(data).subscribe((newdata) => {
      this.successDatails = newdata.data;
      this.success(newdata.data.description, newdata.data._id);
      this.loading = false;
    },
      (err) => {
        this.loading = false;
        this.errors = err.errors;
      });
  }

  success(name, id) {
    const modalRef = this.modal.open(SuccessModalComponent, {
      ariaLabelledBy: 'modal-basic-title',
    });
    modalRef.componentInstance.message = 'has been Scheduled';
    modalRef.componentInstance.title = 'Thank you Training';
    modalRef.componentInstance.name = name;
    modalRef.componentInstance.messageEnabled = true;
    modalRef.componentInstance.smsId = id;
    modalRef.componentInstance.serviceName = 'training';
    modalRef.result.finally(() => {
      this.router.navigateByUrl('admin/training/schedule/list');
    });
  }

  sendMessage() {
    this.loading = true;
    const data = this.successDatails._id;

    this.trainingService.sendMessage(data).subscribe((newdata) => {
      this.router.navigateByUrl('admin/training/schedule/list');
      this.loading = false;
    });
  }

  formatDate(date) {

    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();


    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    hours = hours % 24;
    hours = hours ? hours : 24; // the hour '0' should be '24'
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes;
    return strTime;
  }
}
