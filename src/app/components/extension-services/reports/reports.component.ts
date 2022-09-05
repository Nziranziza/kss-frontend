import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs';
import {
  AuthenticationService,
  BasicComponent,
  GroupService,
  LocationService,
  OrganisationService,
  ReportService,
  SeasonService,
  SiteService,
  TrainingService,
} from 'src/app/core';
import {DatePipe} from '@angular/common';
import {isUndefined} from "util";

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent extends BasicComponent implements OnInit {
  newOrg: any;
  newData: any;
  selectedGroup: any;
  dataCsv: any;
  dataPdf: any;

  constructor(
    private formBuilder: FormBuilder,
    private seasonService: SeasonService,
    private authenticationService: AuthenticationService,
    private locationService: LocationService,
    private organisationService: OrganisationService,
    private groupService: GroupService,
    private trainingService: TrainingService,
    private reportService: ReportService,
    private siteService: SiteService,
    private datePipe: DatePipe
  ) {
    super(locationService, organisationService);
  }

  loading = false;
  reportForm: FormGroup;
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  dt2Options: DataTables.Settings = {};
  // @ts-ignore
  dt2Trigger: Subject = new Subject();
  dt3Options: DataTables.Settings = {};
  // @ts-ignore
  dt3Trigger: Subject = new Subject();
  dt4Options: DataTables.Settings = {};
  // @ts-ignore
  dt4Trigger: Subject = new Subject();
  dt5Options: DataTables.Settings = {};
  // @ts-ignore
  dt5Trigger: Subject = new Subject();
  groups: any[] = [];
  currentSeason: any;
  stats: any = {};
  basePath: any;
  reportsTableData: any[] = [];
  organisations: any[] = [];
  trainings: any[] = [];
  reportBody: any;
  dataFile: any;
  reportGenerated = false;
  initialValue = '';
  currentDate: any;
  seasonStartingDate: any;
  keyword = 'organizationName';
  groupKeyword = 'groupName';
  weekDays: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  ngOnInit() {
    this.dtOptions,
      this.dt2Options,
      this.dt3Options,
      this.dt4Options = {
        pagingType: 'full_numbers',
        pageLength: 10,
      };
    this.reportForm = this.formBuilder.group({
      reportFor: [''],
      filter: this.formBuilder.group({
        locationBy: [''],
        location: this.formBuilder.group({
          prov_id: [''],
          dist_id: [''],
          sect_id: [''],
          cell_id: [''],
          village_id: [''],
        }),
        cws: this.formBuilder.group({
          groupId: [''],
          org_id: ['']
        }),
        date: [''],
        training: this.formBuilder.group({
          trainingId: ['']
        }),
      })
    });
    this.seasonStartingDate = this.datePipe.transform(this.authenticationService.getCurrentSeason().created_at, 'yyyy-MM-dd');
    this.currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.basicInit();
    this.initial();
    this.onChanges();
  }

  initial() {
    this.getTrainings();
    this.getOrganisations();
  }

  getTrainings(): void {
    this.loading = true;
    this.trainingService.all().subscribe((data) => {
      this.trainings = data.data;
      this.loading = false;
    });
  }

  getOrganisations() {
    this.organisationService.all().subscribe((data) => {
      if (data) {
        this.organisations.unshift({
          organizationName: 'all cws',
          _id: '',
        });
      }
    });
  }

  selectEvent(item) {
    if(item._id !== '') {
      this.newOrg = item._id;
      this.newData = this.organisations.find((org) => org._id === item._id);
      this.locationSectors = this.filterZoningSectors(this.newData.coveredSectors);
      this.locationVillages = [];
      this.locationCells = [];
      this.reportBody.reference = this.newOrg;
      if (this.reportForm.controls.filter.get('locationBy').value === 'cws' && this.newOrg) {
        this.groupService.list({
          ...this.getLocation(),
          ...(this.newOrg && {reference: this.newOrg}),
        }).subscribe((data) => {
          this.groups = data.data;
          this.groups.unshift({
            groupName: 'all groups',
            _id: '',
          });
        });
      }
    } else {
      this.newOrg = undefined;
    }
    this.getStats();
  }

  deselectEvent() {
    this.newOrg = undefined;
    this.getStats();
  }

  selectGroupEvent(item) {
    if(item._id !== '') {
      this.selectedGroup = item._id;
    } else {
      this.selectedGroup = undefined;
    }
    this.getStats();
  }

  deselectGroupEvent(item) {
    this.selectedGroup = undefined;
  }

  onChanges() {
    this.reportForm.get('reportFor').valueChanges.subscribe((value) => {
      this.reportForm.get('reportFor').patchValue(value, {emitEvent: false});
      this.reportBody = {};
      this.stats = {};
      this.reportsTableData = [];
      this.getStats();
    });
    this.reportForm.controls.filter.get('training.trainingId'.toString()).valueChanges.subscribe((value) => {
      this.reportForm.controls.filter.get('training.trainingId'.toString()).patchValue(value, {emitEvent: false});
      this.getStats();
    });
    this.reportForm.controls.filter.get('date').valueChanges.subscribe((value) => {
      this.reportForm.controls.filter.get('date').patchValue(value, {emitEvent: false});
      this.getStats();
    });
    this.reportForm.controls.filter.get('locationBy').valueChanges.subscribe((value) => {
      this.reportForm.controls.filter.get('locationBy').patchValue(value, {emitEvent: false});
      if (value !== 'cws') {
        this.resetCWSFilter();
      }
      this.locationChangDistrict(this.reportForm.get('filter') as FormGroup, value);
      this.reportForm.controls.filter.get('location.sect_id').setValue('', {emitEvent: false});
      this.reportForm.controls.filter.get('location.cell_id').setValue('', {emitEvent: false});
      this.reportForm.controls.filter.get('location.village_id').setValue('', {emitEvent: false});
      this.locationSectors = [];
      this.locationCells = [];
      this.locationVillages = [];
      this.getStats();
    });
    this.reportForm.controls.filter
      .get('location.prov_id'.toString())
      .valueChanges.subscribe((value) => {
      this.reportForm.controls.filter
        .get('location.prov_id'.toString()).patchValue(value, {emitEvent: false});
      this.locationChangeProvince(this.reportForm.get('filter') as FormGroup, value);
      this.siteService
        .getZone({prov_id: value, searchBy: 'province'})
        .subscribe((data) => {
          if (data) {
            this.organisations = data.content.filter((org) =>
              org.organizationRole.includes(1)
            );
            this.organisations.unshift({
              organizationName: 'all cws',
              _id: '',
            });
          }
        });
      this.getStats();
    }, () => {
    }, () => {
    });
    this.reportForm.controls.filter
      .get('location.dist_id'.toString())
      .valueChanges.subscribe((value) => {
      this.reportForm.controls.filter
        .get('location.dist_id'.toString()).patchValue(value, {emitEvent: false});
      this.locationChangDistrict(this.reportForm.get('filter') as FormGroup, value);
      this.siteService
        .getZone({dist_id: value, searchBy: 'district'})
        .subscribe((data) => {
          if (data) {
            this.organisations = data.content.filter((org) =>
              org.organizationRole.includes(1)
            );
            this.organisations.unshift({
              organizationName: 'all cws',
              _id: '',
            });
          }
        });
      this.getStats();
    });
    this.reportForm.controls.filter
      .get('location.sect_id'.toString())
      .valueChanges.subscribe((value) => {
      this.reportForm.controls.filter
        .get('location.sect_id'.toString()).patchValue(value, {emitEvent: false});
      if (!isUndefined(this.newOrg) && (this.newOrg !== '')) {
        this.locationCells = this.filterZoningCells(this.newData.coveredSectors, value);
      } else {
        this.locationChangSector(this.reportForm.get('filter') as FormGroup, value);
      }
      if (this.reportForm.controls.filter.get('locationBy').value === 'cws' && this.newOrg) {
        this.groupService.list({
          ...(this.newOrg && {reference: this.newOrg}),
          ...{location: {sect_id: value}}
        }).subscribe((data) => {
          this.groups = data.data;
        });
      }
      this.getStats();
    });

    this.reportForm.controls.filter
      .get('location.cell_id'.toString())
      .valueChanges.subscribe((value) => {
      this.reportForm.controls.filter
        .get('location.cell_id'.toString()).patchValue(value, {emitEvent: false});
      this.locationService.getVillages(value).subscribe((data) => {
        this.locationVillages = data;
        if (!isUndefined(this.newOrg) && (this.newOrg !== '')) {
          this.locationVillages = this.filterZoningVillages(this.newData.coveredSectors, this.reportForm.controls.filter
            .get('location.sect_id'.toString()).value, this.locationVillages);
        }
      });
      if (this.reportForm.controls.filter.get('locationBy').value === 'cws' && this.newOrg) {
        this.groupService.list({
          ...(this.newOrg && {reference: this.newOrg}),
          ...{location: {cell_id: value}}
        }).subscribe((data) => {
          this.groups = data.data;
        });
      }
      this.getStats();
    });

    this.reportForm.controls.filter
      .get('location.village_id'.toString())
      .valueChanges.subscribe((value) => {
      this.reportForm.controls.filter
        .get('location.village_id'.toString()).patchValue(value, {emitEvent: false});
      if (this.reportForm.controls.filter.get('locationBy').value === 'cws' && this.newOrg) {
        this.groupService.list({
          ...(this.newOrg && {reference: this.newOrg}),
          ...{location: {village_id: value}}
        }).subscribe((data) => {
          this.groups = data.data;
        });
      }
      this.getStats();
    });
  }

  getLocation() {
    const value = JSON.parse(JSON.stringify(this.reportForm.value));
    return {
      ...(value.filter.location.prov_id !== '' &&
        {location: {prov_id: value.filter.location.prov_id}}),
      ...(value.filter.location.dist_id !== '' &&
        {location: {dist_id: value.filter.location.dist_id}}),
      ...(value.filter.location.sect_id !== '' &&
        {location: {sect_id: value.filter.location.sect_id}}),
      ...(value.filter.location.cell_id !== '' &&
        {location: {cell_id: value.filter.location.cell_id}}),
      ...(value.filter.location.village_id !== '' &&
        {location: {village_id: value.filter.location.village_id}})
    };
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

  getStats() {
    const value = this.reportForm.get('reportFor').value;
    let body = this.getLocation();
    const form = JSON.parse(JSON.stringify(this.reportForm.value));
    if (value === 'Farmer Groups') {
      body = {
        ...body,
        ...(this.newOrg && {reference: this.newOrg})
      };
      this.reportBody = body;
      this.reportService.groupStats(body).subscribe((data) => {
        this.stats = data.data[0];
      });
    } else if (value === 'Trainings') {
      const date = form.filter.date;
      body = {
        ...body,
        ...(this.newOrg && {reference: this.newOrg}),
        ...(form.filter.training.trainingId !== '' && {trainingId: form.filter.training.trainingId}),
        ...(this.selectedGroup && {groupId: this.selectedGroup}),
        ...(form.filter.date !== '' && {
          date: {
            from: date[0],
            to: date[1],
          }
        })
      };
      this.reportBody = body;
      this.reportService.trainingStats(body).subscribe((data) => {
        this.stats = data.data[0];
      });
    } else if (value === 'Farm Visits') {
      const date = form.filter.date;
      body = {
        ...body,
        ...(this.newOrg && {reference: this.newOrg}),
        ...(this.selectedGroup && {groupId: this.selectedGroup}),
        ...(form.filter.date !== '' && {
          date: {
            from: date[0],
            to: date[1],
          }
        })
      };
      this.reportBody = body;
      this.reportService.visitStats(body).subscribe((data) => {
        this.stats = data.data[0];
      });
    } else if (value === 'Coffee Farmers') {
      body = {
        ...body,
        ...(this.newOrg && {org_id: this.newOrg}),
        ...{searchBy: 'farmer'}
      };
      this.reportBody = body;
      this.reportService.farmStats(body).subscribe((data) => {
        this.stats = data.data[0];
        console.log(data);
      });
    } else if (value === 'Coffee Farms') {
      body = {
        ...body,
        ...(this.newOrg && {org_id: this.newOrg}),
        ...{searchBy: 'farm'}
      };
      this.reportBody = body;
      this.reportService.farmStats(body).subscribe((data) => {
        this.stats = data.data[0];
        console.log(data);
      });
    }
  }

  downloadCsv() {
    this.generateFinalReport();
  }

  generateReport() {
    if (this.reportForm.value.reportFor === 'Farmer Groups') {
      this.reportsTableData = [];
      this.reportService.groupSummary(this.reportBody).subscribe((data) => {
        this.reportsTableData = data.data;
        this.dtTrigger.next();
        this.reportGenerated = true;
      });
    } else if (this.reportForm.value.reportFor === 'Trainings') {
      this.reportsTableData = [];
      this.reportService.trainingSummary(this.reportBody).subscribe((data) => {
        this.reportsTableData = data.data;
        this.dt2Trigger.next();
        this.reportGenerated = true;
      });
    } else if (this.reportForm.value.reportFor === 'Farm Visits') {
      this.reportsTableData = [];
      this.reportService.visitSummary(this.reportBody).subscribe((data) => {
        this.reportsTableData = data.data;
        this.dt3Trigger.next();
        this.reportGenerated = true;
      });
    } else if (this.reportForm.value.reportFor === 'Coffee Farmers') {
      this.reportsTableData = [];
      this.reportBody.searchBy = 'farmer';
      console.log('-------');
      this.reportService.farmSummary(this.reportBody).subscribe((data) => {
        this.reportsTableData = data.data;
        console.log(data);
        this.dt3Trigger.next();
        this.reportGenerated = true;
      });
    } else if (this.reportForm.value.reportFor === 'Coffee Farms') {
      this.reportsTableData = [];
      console.log('-------');
      this.reportBody.searchBy = 'farm';
      this.reportService.farmSummary(this.reportBody).subscribe((data) => {
        this.reportsTableData = data.data;
        console.log(data);
        this.dt3Trigger.next();
        this.reportGenerated = true;
      });
    }
  }

  generateFinalReport() {
    if (this.reportForm.value.reportFor === 'Farmer Groups') {
      this.reportService
        .groupDownload(this.reportBody, 'xlsx')
        .subscribe((data) => {
          this.dataFile = data.data.file;
        });
      this.reportService
        .groupDownload(this.reportBody, 'csv')
        .subscribe((data) => {
          this.dataCsv = data.data.file;
        });
      this.reportService
        .groupDownload(this.reportBody, 'pdf')
        .subscribe((data) => {
          this.dataPdf = data.data.file;
        });
    } else if (this.reportForm.value.reportFor === 'Trainings') {
      this.reportService
        .trainingDownload(this.reportBody, 'xlsx')
        .subscribe((data) => {
          this.dataFile = data.data.file;
        });
      this.reportService
        .trainingDownload(this.reportBody, 'csv')
        .subscribe((data) => {
          this.dataCsv = data.data.file;
        });
      this.reportService
        .trainingDownload(this.reportBody, 'pdf')
        .subscribe((data) => {
          this.dataPdf = data.data.file;
        });
    } else if (this.reportForm.value.reportFor === 'Farm Visits') {
      this.reportService
        .visitDownload(this.reportBody, 'xlsx')
        .subscribe((data) => {
          this.dataFile = data.data.file;
        });
      this.reportService
        .visitDownload(this.reportBody, 'csv')
        .subscribe((data) => {
          this.dataCsv = data.data.file;
        });
      this.reportService
        .visitDownload(this.reportBody, 'pdf')
        .subscribe((data) => {
          this.dataPdf = data.data.file;
        });
    } else if (this.reportForm.value.reportFor === 'Coffee Farmers') {
      this.reportBody.searchBy = 'farmer';
      this.reportService
        .farmDownload(this.reportBody, 'xlsx')
        .subscribe((data) => {
          this.dataFile = data.data.file;
        });
      this.reportService
        .farmDownload(this.reportBody, 'csv')
        .subscribe((data) => {
          this.dataCsv = data.data.file;
        });
      this.reportService
        .farmDownload(this.reportBody, 'pdf')
        .subscribe((data) => {
          this.dataPdf = data.data.file;
        });
    } else if (this.reportForm.value.reportFor === 'Coffee Farms') {
      this.reportBody.searchBy = 'farm';
      this.reportService
        .farmDownload(this.reportBody, 'xlsx')
        .subscribe((data) => {
          this.dataFile = data.data.file;
        });
      this.reportService
        .farmDownload(this.reportBody, 'csv')
        .subscribe((data) => {
          this.dataCsv = data.data.file;
        });
      this.reportService
        .farmDownload(this.reportBody, 'pdf')
        .subscribe((data) => {
          this.dataPdf = data.data.file;
        });
    }
  }

  resetCWSFilter() {
    this.groups = [];
    this.selectedGroup = undefined;
    this.newOrg = undefined;
    this.newData = undefined;
  }

}
