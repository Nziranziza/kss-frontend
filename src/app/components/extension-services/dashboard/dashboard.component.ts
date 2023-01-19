import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChartType } from 'angular-google-charts';
import {
  AuthenticationService,
  BasicComponent,
  FarmService,
  GapService,
  GroupService,
  LocationService,
  OrganisationService,
  SeasonService,
  TrainingService,
  UserService,
  VisitService,
  SeedlingService,
  SiteService,
} from 'src/app/core';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent extends BasicComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    protected locationService: LocationService,
    private organisationService: OrganisationService,
    private trainingService: TrainingService,
    private userService: UserService,
    private visitService: VisitService,
    private gapService: GapService,
    private seasonService: SeasonService,
    private groupService: GroupService,
    private farmService: FarmService,
    private seedlingService: SeedlingService,
    private readonly sso: ScrollStrategyOptions,
    private route: ActivatedRoute,
    private siteService: SiteService
  ) {
    super(locationService, organisationService);
    this.scrollStrategy = this.sso.noop();
  }
  scrollStrategy: ScrollStrategy;
  organisationId = '';
  dashboardForm: FormGroup;
  trainingFilterEnabled = false;
  visitFilterEnabled = false;
  seedlingFilterEnabled = false;
  gapFilterEnabled = false;
  organisations = [];
  pageLoading = false;

  newOrg = '';

  farms: any[] = [];
  oneLand: any;
  maxDate: any;
  minDate: any;
  farmDetails: any;

  graph = {
    type: ChartType.PieChart,
    data: [
      ['Female', 0],
      ['Male', 0],
    ],
    dummyData: [
      ['Female', 50],
      ['Male', 50],
    ],
    options: {
      colors: ['#FF69F6', '#35A1FF'],
      legend: { position: 'none' },
      pieHole: 0.3,
      pieSliceTextStyle: {
        color: 'black',
      },

      labels: {
        display: false // not working
      },
      backgroundColor: { fill: 'transparent' },
      chartArea: {
        left: 20,
        top: 10,
        bottom: 10,
        width: '80%',
        height: '150',
      },
    },
    columnNames: ['female', 'male'],
    width: '80%',
    height: 160,

  };

  seedlingGraph = {
    type: ChartType.PieChart,
    data: [
      ['Variety 1', 0],
      ['Variety 2', 0],
      ['Variety 3', 0],
    ],
    dummyData: [
      ['Variety 1', 100],
    ],
    options: {
      colors: ['#F5B23F', '#FF990A'],
      legend: { position: 'none' },
      pieHole: 0.4,
      pieSliceTextStyle: {
        color: 'black',
      },
      backgroundColor: { fill: 'transparent' },
      chartArea: {
        left: 5,
        top: 20,
        bottom: 20,
        width: '100%',
        height: '200',
      },
    },
    columnNames: ['Variety1', 'Variety2'],
    width: '100%',
    height: 220,
  };

  selectedFarmDetails: any;
  clickedMarker = false;
  trainings: any[] = [];
  trainers: any[] = [];
  trainingsStats: any = {
    femaleAbsent: 0,
    femalePresent: 0,
    maleAbsent: 0,
    malePresent: 0,
    totalAbsent: 0,
    totalInvitees: 0,
    totalPresent: 0,
  };
  visitStats: any = { femaleFarmVisits: 0, maleFarmVisits: 0, totalVisits: 0 };
  gapAdoptionStats: any[] = [];
  seedlingStats: any[] = [];
  totalSeedlings = 0;
  coveredSectors: any[] = [];
  groups: any[] = [];
  nurseries: any[] = [];
  selectedGroup: string;
  initialValue = '';
  keyword = 'organizationName';
  groupKeyword = 'groupName';
  agronomistKeyword = 'fullName';
  nurseryKeyword = 'nurseryName';
  seasons: any[];
  currentSeason: any;
  selectedNursery: any;
  currentSeasonYear: any;
  currentSelectedLocation: any;
  dateRangeMin: any = {
    trainingFilters: '',
    visitFilters: '',
    seedlingFilters: '',
    gapFilters: '',
    location: '',
  };
  dateRangeMax: any = {
    trainingFilters: '',
    visitFilters: '',
    seedlingFilters: '',
    gapFilters: '',
    location: '',
  };
  mainBody: any = {};
  markersArray = [];
  generalFarmStats: any = {};
  selectedAgronomist: any;
  starterBody: any = {};
  weeks = [
    { id: 1, name: 'Week 1', start: '01', end: '07' },
    { id: 2, name: 'Week 2', start: '07', end: '14' },
    { id: 3, name: 'Week 3', start: '14', end: '21' },
    { id: 4, name: 'Week 4', start: '21', end: '31' },
  ];

  quarters = [
    {
      id: 1,
      name: 'Q1',
    },
    {
      id: 2,
      name: 'Q2',
    },
    {
      id: 3,
      name: 'Q3',
    },
    {
      id: 4,
      name: 'Q4',
    },
  ];
  @ViewChild('visitChart ', { static: false }) visitChart;
  @ViewChild('seedChart ', { static: false }) seedChart;
  @ViewChild('mapSet ', { static: false }) mapSet;

  myLatLng = { lat: -2, lng: 30 }; // Map Options
  mapOptions: google.maps.MapOptions = {
    center: this.myLatLng,
    zoom: 8.3,
    styles: [
      {
        featureType: 'administrative.land_parcel',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'administrative.neighborhood',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'poi.attraction',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'poi.business',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'poi.business',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'poi.government',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'poi.medical',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'poi.place_of_worship',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'poi.school',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'poi.sports_complex',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'road',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'water',
        elementType: 'labels.text',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
    ],
  };

  markerOptions: google.maps.MarkerOptions = {
    icon: 'assets/dist/img/sks/ico_locationfarm.svg',
  };

  spots: {
    id: number;
    lat: number;
    lng: number;
  }[] = [
      {
        id: 1,
        lat: -1.9485423,
        lng: 30.0613514,
      },
    ];

  ngOnInit() {
    this.dashboardForm = this.formBuilder.group({
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
        latitude: [''],
        longitude: [''],
        season_id: [''],
        covered_sector: [''],
        filterByDate: [''],
        quarterId: [''],
      }),
      trainingFilters: this.formBuilder.group({
        season_id: [''],
        filterByDate: [''],
        quarterId: [''],
      }),
      visitFilters: this.formBuilder.group({
        season_id: [''],
        filterByDate: [''],
        quarterId: [''],
      }),
      seedlingFilters: this.formBuilder.group({
        season_id: [''],
        filterByDate: [''],
        quarterId: [''],
      }),
      gapFilters: this.formBuilder.group({
        season_id: [''],
        filterByDate: [''],
        quarterId: [''],
      }),
      training_id: [''],
      season_id: [''],
      filterByDate: [''],
      quarterId: [''],
      trainer_id: [''],
      group_id: [''],
      farm_id: [''],
      cws_id: [''],
      covered_sector: [''],
    });
    this.pageLoading = true;
    this.route.parent.params.subscribe((params) => {
      this.organisationId = params['organisationId'.toString()];
      this.starterBody = { referenceId: params['organisationId'.toString()] };
    });

    this.initial();
    this.basicInit(this.authenticationService.getCurrentUser().info.org_id);
    this.onChanges();
  }

  selectMarker(id: string) {
    this.farmService.getLand(id).subscribe((data) => {
      this.farmDetails = data.data;
      this.clickedMarker = true;
      this.loading = false;
    });
  }

  getOrganisations() {
    this.organisationService.all().subscribe((data) => {
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
  }

  getNurseries() {
    const orgId = this.organisationId !== ''
      ? this.organisationId :
      this.authenticationService.getCurrentUser().info.org_id;
    this.seedlingService.all({reference : orgId}).subscribe((data) => {
      this.nurseries = data.data;
      this.nurseries.unshift({ nurseryName: 'all nurseries', _id: '' });
    });
  }

  // initials
  initial() {
    this.getTrainings({});
    this.getNurseries();
    this.getOrganisations();
    this.getFarms(this.starterBody);
    this.seasonService.all().subscribe((data) => {
      this.seasons = data.content;
      this.currentSeason = this.authenticationService.getCurrentSeason();
      this.currentSeasonYear = this.currentSeason.year;
      this.seasonChangeEffect('trainingFilters');
      this.seasonChangeEffect('visitFilters');
      this.seasonChangeEffect('seedlingFilters');
      this.seasonChangeEffect('gapFilters');
      this.seasonChangeEffect('location');
    });
    this.getGeneralStats(this.starterBody);
    this.pageLoading = false;
  }
  // General stats from filters

  getGeneralStats(body: any) {
    this.getTrainingsStats(body);
    this.getGapAdoptionStats(body);
    this.getVisitsStats(body);
    this.getSeedlingStats(body);
    this.getFarmsStats(body);
    this.getTrainings(body);
    delete body.date;
    this.getFarms(body);
  }

  // get stats from filters
  getStats(filterBy: string) {
    this.mainBody = {};
    if (filterBy !== '') {
      let value = [];
      value = this.dashboardForm.controls[filterBy].get('filterByDate').value;
      if (this.newOrg !== '') {
        this.mainBody.referenceId = this.newOrg;
      }
      if (value) {
        if (value.length > 1) {
          if (typeof value[0].getMonth === 'function') {
            this.mainBody.date = {
              from: this.formatDate(value[0]),
              to: this.formatDate(value[1]),
            };
          } else {
            this.mainBody.date = {
              from: value[0],
              to: value[1],
            };
          }
        }
      }
      const locationId = this.currentSelectedLocation;
      if (typeof locationId === 'object' && locationId.locationId !== '') {
        this.mainBody.location = locationId;
      }
    }
    if (filterBy === 'trainingFilters') {
      this.getTrainingsStats(this.mainBody);
    } else if (filterBy === 'visitFilters') {
      this.getVisitsStats(this.mainBody);
    } else if (filterBy === 'seedlingFilters') {
      this.getSeedlingStats(this.mainBody);
    } else if (filterBy === 'gapFilters') {
      this.getGapAdoptionStats(this.mainBody);
    } else if (filterBy === 'location') {
      this.getGeneralStats(this.mainBody);
      this.clickedMarker = false;
      this.myLatLng = { lat: -2, lng: 30 };
    }
  }

  disableFarmDetailsPopup() {
    this.clickedMarker = false
  }

  selectEvent(item) {
    this.newOrg = item._id;
    const newData = this.organisations.filter((org) => org._id === item._id);
    this.dashboardForm.controls.location.get('sect_id'.toString()).setValue('');
    this.coveredSectors = newData[0].coveredSectors;
  }

  selectGroupEvent(item) {
    this.selectedGroup = item._id;
    let body: any = {};
    if (this.selectedGroup !== '') {
      body = {
        groupId: item._id,
      };
    }
    if (this.dashboardForm.value.trainingId !== '') {
      body.trainingId = this.dashboardForm.value.trainingId;
    }
    if (this.selectedAgronomist !== '') {
      body.trainerId = this.selectedAgronomist;
    }
    this.getTrainingsStats(body);
  }

  selectAgronomistEvent(item) {
    this.selectedAgronomist = item.userId;
    if (this.selectedGroup !== '') {
      this.mainBody.groupId = this.selectedGroup;
    }
    if (this.dashboardForm.value.trainingId !== '') {
      this.mainBody.trainingId = this.dashboardForm.value.trainingId;
    }
    if (item.userId !== '') {
      this.mainBody.trainerId = item.userId;
    }
    this.getTrainingsStats(this.mainBody);
    delete this.mainBody.groupId;
    delete this.mainBody.trainingId;
    delete this.mainBody.trainerId;
  }

  deselectAgronomistEvent() {
    this.selectedAgronomist = '';
    if (this.dashboardForm.value.trainingId !== '') {
      this.mainBody.trainingId = this.dashboardForm.value.trainingId;
    }
    if (this.selectedGroup !== '') {
      this.mainBody.groupId = this.selectedGroup;
    }
    this.getTrainingsStats(this.mainBody);
    delete this.mainBody.groupId;
    delete this.mainBody.trainingId;
  }

  deselectEvent() {
    this.newOrg = '';
    this.dashboardForm.controls.location.get('sect_id'.toString()).setValue('');
  }

  selectNurseryEvent(item) {
    this.selectedNursery = item._id;
    this.getSeedlingStats({ nurseryId: this.selectedNursery });
  }

  deselectNurseryEvent() {
    this.selectedNursery = '';
    this.getSeedlingStats({});
  }

  deselectGroupEvent() {
    this.selectedGroup = '';
    const body: any = {};
    if (this.dashboardForm.value.trainingId !== '') {
      body.trainingId = this.dashboardForm.value.trainingId;
    }
    if (this.selectedAgronomist !== '') {
      body.trainerId = this.selectedAgronomist;
    }
    this.getTrainingsStats(body);
  }

  getTrainings(body: any): void {
    this.loading = true;
    this.trainingService.allByDashboardFilter(body).subscribe((data) => {
      this.trainings = data.data;
      this.trainers = [{ groupName: 'all trainers', _id: '' }];
      this.groups = [{ groupName: 'all groups', _id: '' }];
      data.data.map((training) => {
        training.trainers.map((trainer) => {
          if (this.trainers.every(data => data._id !== trainer._id)) {
            this.trainers.push(trainer);
          }
        })
        training.groups.map((group) => {
          if (this.groups.every(data => data._id !== group._id)) {
            this.groups.push(group);
          }
        })
      });
      this.loading = false;
    });
  }

  getTrainingsStats(body: any): void {
    this.loading = true;
    this.trainingService.getScheduleStats(body).subscribe((data) => {
      this.trainingsStats = data.data;
      this.loading = false;
    });
  }

  getSeedlingStats(body: any): void {
    this.loading = true;
    this.seedlingStats = [];
    const colors = ['#F5B23F', '#FF990A', '#FF6600', '#FF3300', '#FF0000'];
    this.seedlingService.getSeedlingStats(body).subscribe((data) => {
      this.seedlingStats = data.data;
      this.totalSeedlings = 0;
      this.seedlingStats.forEach((data) => {
        this.totalSeedlings += data.totalQuantity;
      });
      this.seedlingGraph.data = [];
      this.seedlingStats.forEach((data, index) => {
        this.seedlingGraph.data.push([data.variety, (data.totalQuantity * 100) / this.totalSeedlings])
        this.seedlingGraph.options.colors.push(colors[index]);
      });
      this.loading = false;
      this.seedlingGraph = Object.assign([], this.seedlingGraph);
    });
  }

  getFarms(body: any) {
    this.loading = true;
    this.farms = [];
    this.farmService.all(body).subscribe((data) => {
      data.data.forEach((item) => {
        this.farms.push({
          id: item.farmId,
          lat: parseFloat(item.latitude),
          lng: parseFloat(item.longitude),
        });
      });
      this.loading = false;
    });
  }

  getFarmsStats(body: any) {
    this.loading = true;
    this.farmService.farmStats(body).subscribe((data) => {
      this.generalFarmStats = data.data;
      this.loading = false;
    });
  }

  getOneLand() {
    this.loading = true;
    this.farmService.getLand('').subscribe((data) => {
      this.oneLand = data.data;
    });
  }

  getVisitsStats(body: any): void {
    this.loading = true;
    this.visitService.getVisitsStats(body).subscribe((data) => {
      this.visitStats = data.data;
      this.graph.data = [];
      this.graph.data.push(['Female', (this.visitStats.femaleFarmVisits * 100) /
        this.visitStats.totalFarmersVisited], ['male', (this.visitStats.maleFarmVisits * 100) /
          this.visitStats.totalFarmersVisited]);
      this.loading = false;
    });
    this.graph = Object.assign([], this.graph);
  }

  getGapAdoptionStats(body: any): void {
    this.loading = true;
    this.gapService.getGapsStats(body).subscribe((data) => {
      this.gapAdoptionStats = data.data;
      this.loading = false;
    });
  }

  onChanges() {
    this.dashboardForm.controls.location
      .get('prov_id'.toString())
      .valueChanges.subscribe((value) => {

        this.dashboardForm.controls.location
          .get('dist_id'.toString())
          .setValue('');
        this.dashboardForm.controls.location
          .get('sect_id'.toString())
          .setValue('');
        this.newOrg = '';
        this.locationChangeProvince(this.dashboardForm, value);
        if (value !== '') {
          this.currentSelectedLocation = {
            searchBy: 'prov_id',
            locationId: value,
          };
          this.siteService
            .getZone({ prov_id: value, searchBy: 'province' })
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
        } else {
          this.currentSelectedLocation = {
            searchBy: '',
            locationId: '',
          };
        }
      });

    this.dashboardForm.controls.location
      .get('dist_id'.toString())
      .valueChanges.subscribe((value) => {

        this.dashboardForm.controls.location
          .get('sect_id'.toString())
          .setValue('');
        this.newOrg = '';
        this.locationChangDistrict(this.dashboardForm, value);
        if (value !== '') {
          this.currentSelectedLocation = {
            searchBy: 'dist_id',
            locationId: value,
          };
          this.siteService
            .getZone({ dist_id: value, searchBy: 'district' })
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
        } else {
          this.currentSelectedLocation = {
            searchBy: 'prov_id',
            locationId:
              this.dashboardForm.controls.location.get('prov_id').value,
          };
        }
      });

    this.dashboardForm.controls.location
      .get('sect_id'.toString())
      .valueChanges.subscribe((value) => {

        this.newOrg = '';
        if (value !== '') {
          this.locationChangSector(this.dashboardForm, value);
          this.currentSelectedLocation = {
            searchBy: 'sect_id',
            locationId: value,
          };
        } else {
          this.currentSelectedLocation = {
            searchBy: 'dist_id',
            locationId:
              this.dashboardForm.controls.location.get('dist_id').value,
          };
        }
      });


    this.dashboardForm.controls.training_id.valueChanges.subscribe((value) => {
      if (this.selectedAgronomist !== '') {
        this.mainBody.trainerId = this.dashboardForm.value.trainerId;
      }
      if (value !== '') {
        this.trainers = [];
        this.groups = [];
        this.mainBody.trainingId = value;
        this.trainings.map((training) => {
          if (training.trainingId === value) {
            this.trainers.push(...training.trainers);
            this.groups.push(...training.groups);
          }
        })
      } else if (value === '') {
        this.trainers = [{ groupName: 'all trainers', _id: '' }];
        this.groups = [{ groupName: 'all groups', _id: '' }];
        this.trainings.map((training) => {
          training.trainers.map((trainer) => {
            if (this.trainers.every(data => data.userId !== trainer.userId)) {
              this.trainers.push(trainer);
            }
          })
          training.groups.map((group) => {
            if (this.groups.every(data => data._id !== group._id)) {
              this.groups.push(group);
            }
          })
        });
      }
      this.getTrainingsStats(this.mainBody);
      delete this.mainBody.trainingId;
      delete this.mainBody.trainerId;
    });
  }

  // season filters
  seasonChangeEffect(group: string) {
    const value =
      this.dashboardForm.controls[group].get('season_id').value !== ''
        ? this.dashboardForm.controls[group].get('season_id').value
        : this.currentSeasonYear;
    this.dateRangeMin[group] = `${parseFloat(value) - 1}-10-01`;
    this.dateRangeMax[group] = `${value}-09-31`;
    this.dashboardForm.controls[group]
      .get('filterByDate')
      .setValue([`${parseFloat(value) - 1}-10-01`, `${value}-10-01`]);
  }

  seasonChange(group: string) {
    this.seasonChangeEffect(group);
    if (group !== 'location') {
      this.getStats(group);
    } else {
      this.dashboardForm.controls.location
        .get('prov_id'.toString())
        .setValue('');
      this.dashboardForm.controls.location
        .get('dist_id'.toString())
        .setValue('');
      this.dashboardForm.controls.location
        .get('sect_id'.toString())
        .setValue('');
      this.newOrg = '';
    }
  }

  seasonQuarterChange(group: string) {
    const value = this.dashboardForm.controls[group].get('quarterId').value;
    const current =
      this.dashboardForm.controls[group].get('season_id').value !== ''
        ? this.dashboardForm.controls[group].get('season_id').value
        : this.currentSeasonYear;
    if (value === '1') {
      this.dateRangeMin[group] = `${parseFloat(current) - 1}-10-01`;
      this.dateRangeMax[group] = `${current}-01-01`;
      this.dashboardForm.controls[group]
        .get('filterByDate')
        .setValue([`${parseFloat(current) - 1}-10-01`, `${current}-01-01`]);
    } else if (value === '2') {
      this.dateRangeMin[group] = `${current}-01-01`;
      this.dateRangeMax[group] = `${current}-04-01`;
      this.dashboardForm.controls[group]
        .get('filterByDate')
        .setValue([`${current}-01-01`, `${current}-04-01`]);
    } else if (value === '3') {
      this.dateRangeMin[group] = `${current}-04-01`;
      this.dateRangeMax[group] = `${current}-07-01`;
      this.dashboardForm.controls[group]
        .get('filterByDate')
        .setValue([`${current}-04-01`, `${current}-07-01`]);
    } else if (value === '4') {
      this.dateRangeMin[group] = `${current}-07-01`;
      this.dateRangeMax[group] = `${current}-10-01`;
      this.dashboardForm.controls[group]
        .get('filterByDate')
        .setValue([`${current}-07-01`, `${current}-10-01`]);
    } else if (value === '') {
      this.dateRangeMin[group] = `${parseFloat(current) - 1}-10-01`;
      this.dateRangeMax[group] = `${current}-10-01`;
      this.dashboardForm.controls[group]
        .get('filterByDate')
        .setValue([`${parseFloat(current) - 1}-10-01`, `${current}-10-01`]);
    }
    this.getStats(group);
  }

  seasonDateChange(group: string) {
    if (group !== 'location') {
      this.getStats(group);
    }
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

  enableFilter(value: boolean, type: string) {
    if (type === 'training') {
      this.trainingFilterEnabled = value;
    } else if (type === 'seedling') {
      this.seedlingFilterEnabled = value;
    } else if (type === 'gap') {
      this.gapFilterEnabled = value;
    } else if (type === 'visit') {
      this.visitFilterEnabled = value;
    }
  }
}
