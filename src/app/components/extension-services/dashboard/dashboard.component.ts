import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ChartType } from "angular-google-charts";
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
} from "src/app/core";
import { ScrollStrategy, ScrollStrategyOptions } from "@angular/cdk/overlay";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent extends BasicComponent implements OnInit {
  scrollStrategy: ScrollStrategy;
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
    private siteService: SiteService
  ) {
    super(locationService, organisationService);
    this.scrollStrategy = this.sso.noop();
  }

  dashboardForm: FormGroup;
  trainingFilterEnabled: boolean = false;
  visitFilterEnabled: boolean = false;
  seedlingFilterEnabled: boolean = false;
  gapFilterEnabled: boolean = false;
  organisations = [];
  newOrg: String;
  farms: any[] = [];
  oneLand: any;
  maxDate: any;
  minDate: any;
  farmDetails: any;

  graph = {
    type: ChartType.PieChart,
    data: [
      ["Male", 0],
      ["Female", 0],
    ],
    options: {
      colors: ["#35A1FF", "#FF69F6"],
      legend: { position: "none" },
      pieHole: 0.4,
      backgroundColor: { fill: "transparent" },
    },
    columnNames: ["male", "female"],
    width: 320,
    height: 160,
  };

  seedlingGraph = {
    type: ChartType.PieChart,
    data: [
      ["Boubon", 100],
      ["Variety2", 0],
      ["Variety3", 0],
    ],
    options: {
      colors: ["#F5B23F", "#FF990A"],
      legend: { position: "none" },
      pieHole: 0.2,
      backgroundColor: { fill: "transparent" },
    },
    columnNames: ["Variety1", "Variety2"],
    width: 320,
    height: 230,
  };

  selectedFarmDetails: any;
  clickedMarker: Boolean = false;
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
  selectedGroup: String;
  initialValue = "";
  keyword = "organizationName";
  groupKeyword = "groupName";
  nurseryKeyword = "nurseryName";
  seasons: any[];
  currentSeason: any;
  selectedNursery: any;
  currentSeasonYear: any;
  currentSelectedLocation: any;
  dateRangeMin: any;
  dateRangeMax: any;
  mainBody: any = {};

  weeks = [
    { id: 1, name: "Week 1", start: "01", end: "07" },
    { id: 2, name: "Week 2", start: "07", end: "14" },
    { id: 3, name: "Week 3", start: "14", end: "21" },
    { id: 4, name: "Week 4", start: "21", end: "31" },
  ];

  quarters = [
    {
      id: 1,
      name: "Q1",
    },
    {
      id: 2,
      name: "Q2",
    },
    {
      id: 3,
      name: "Q3",
    },
    {
      id: 4,
      name: "Q4",
    },
  ];

  ngOnInit() {
    this.dashboardForm = this.formBuilder.group({
      location: this.formBuilder.group({
        prov_id: [""],
        dist_id: [""],
        sect_id: [""],
        cell_id: [""],
        village_id: [""],
        latitude: [""],
        longitude: [""],
      }),
      training_id: [""],
      trainer_id: [""],
      filterByDate: [""],
      season_id: [""],
      group_id: [""],
      farm_id: [""],
      cws_id: [""],
      quarterId: [""],
      covered_sector: [""],
    });
    this.initial();
    this.basicInit(this.authenticationService.getCurrentUser().info.org_id);
    this.onChanges();
  }

  myLatLng = { lat: -2, lng: 30 }; // Map Options
  mapOptions: google.maps.MapOptions = {
    center: this.myLatLng,
    zoom: 8.3,
  };

  markerOptions: google.maps.MarkerOptions = {
    icon: "assets/dist/img/sks/ico_locationfarm.svg",
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

  selectMarker(id: string) {
    this.farmService.getLand(id).subscribe((data) => {
      this.farmDetails = data.data;
      this.clickedMarker = true;
      this.loading = false;
    });
  }

  getFarmerGroup() {
    this.loading = true;
    this.groupService.all({}).subscribe((data) => {
      this.groups = data.data;
      this.loading = false;
    });
  }

  getOrganisations() {
    this.organisationService.all().subscribe((data) => {
      if (data) {
        this.organisations = data.content.filter((org) =>
          org.organizationRole.includes(1)
        );
      }
    });
  }

  getNurseries() {
    this.seedlingService.all().subscribe((data) => {
      this.nurseries = data.data;
    });
  }

  // initials
  initial() {
    this.getTrainers();
    this.getNurseries();
    this.getTrainings();
    this.getOrganisations();
    this.getFarms();
    this.getFarmerGroup();
    this.seasonService.all().subscribe((data) => {
      this.seasons = data.content;
      this.currentSeason = this.authenticationService.getCurrentSeason();
      this.currentSeasonYear = this.currentSeason.year;
      this.dateRangeMin = `${parseFloat(this.currentSeasonYear) - 1}-10-01`;
      this.dateRangeMax = `${this.currentSeasonYear}-09-31`;
      this.dashboardForm.controls.filterByDate.setValue([
        `${parseFloat(this.currentSeasonYear) - 1}-10-01`,
        `${this.currentSeasonYear}-10-01`,
      ]);
    });
    this.getGeneralStats({});
  }
  // General stats from filters
  getGeneralStats(body: any) {
    this.getTrainingsStats(body);
    this.getGapAdoptionStats(body);
    this.getVisitsStats(body);
    this.getSeedlingStats(body);
  }

  // get stats from filters
  getStats(filterBy: string) {
    if (filterBy === "training") {
      if (this.dashboardForm.value.filterByDate.length > 1) {
        this.mainBody.date = {
          from: this.dashboardForm.value.filterByDate[0],
          to: this.dashboardForm.value.filterByDate[1],
        };
      }
      this.getTrainingsStats(this.mainBody);
    } else if (filterBy === "visits") {
      if (this.dashboardForm.value.filterByDate.length > 1) {
        this.mainBody.date = {
          from: this.dashboardForm.value.filterByDate[0],
          to: this.dashboardForm.value.filterByDate[1],
        };
      }
      this.visitStats(this.mainBody);
    } else if (filterBy === "seedling") {
      if (this.dashboardForm.value.filterByDate.length > 1) {
        this.mainBody.date = {
          from: this.dashboardForm.value.filterByDate[0],
          to: this.dashboardForm.value.filterByDate[1],
        };
      }
      this.getSeedlingStats(this.mainBody);
    } else if (filterBy === "gap") {
      if (this.dashboardForm.value.filterByDate.length > 1) {
        this.mainBody.date = {
          from: this.dashboardForm.value.filterByDate[0],
          to: this.dashboardForm.value.filterByDate[1],
        };
      }
      this.getGapAdoptionStats(this.mainBody);
    } else if (filterBy === "location") {
      this.mainBody = {};
      const locationId = this.currentSelectedLocation;
      if (typeof locationId === "object") {
        this.mainBody.location = locationId;
      }
      if (this.newOrg != "") {
        this.mainBody.referenceId = this.newOrg;
        if (this.dashboardForm.value.covered_sector != "") {
          this.mainBody.location = {
            searchBy: "sect_id",
            locationId: this.dashboardForm.value.covered_sector,
          };
        }
      }
      this.getGeneralStats(this.mainBody);
    }
  }

  selectEvent(item) {
    this.newOrg = item._id;
    let newData = this.organisations.filter((org) => org._id === item._id);
    this.coveredSectors = newData[0].coveredSectors;
  }

  selectGroupEvent(item) {
    this.selectedGroup = item._id;
    let body: any = {
      groupId: item._id,
    };
    if (this.dashboardForm.value.trainingId != "") {
      body.trainingId = this.dashboardForm.value.trainingId;
    }
    if (this.dashboardForm.value.trainer_id != "") {
      body.trainerId = this.dashboardForm.value.trainer_id;
    }
    this.getTrainingsStats(body);
  }

  deselectEvent() {
    this.newOrg = "";
  }

  selectNurseryEvent(item) {
    this.selectedNursery = item._id;
    this.getSeedlingStats({ nurseryId: item._id });
  }

  deselectNurseryEvent() {
    this.selectedNursery = "";
    this.getSeedlingStats({});
  }

  deselectGroupEvent() {
    this.selectedGroup = "";
  }

  getTrainings(): void {
    this.loading = true;
    this.trainingService.all().subscribe((data) => {
      this.trainings = data.data;
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
    this.seedlingService.getSeedlingStats(body).subscribe((data) => {
      this.seedlingStats = data.data;
      this.totalSeedlings = 0;
      this.seedlingStats.forEach((data) => {
        this.totalSeedlings += data.totalQuantity;
      });
      this.seedlingStats.forEach((data, index) => {
        this.seedlingGraph.data[index][index] = data.variety;
        this.seedlingGraph.data[index][index + 1] =
          (data.totalQuantity * 100) / this.totalSeedlings;
      });
      this.loading = false;
    });
  }

  getFarms() {
    this.loading = true;
    this.farmService.all().subscribe((data) => {
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

  getOneLand() {
    this.loading = true;
    this.farmService.getLand("").subscribe((data) => {
      this.oneLand = data.data;
    });
  }

  getVisitsStats(body: any): void {
    this.loading = true;
    this.visitService.getVisitsStats(body).subscribe((data) => {
      this.visitStats = data.data;
      this.graph.data[0][1] =
        (this.visitStats.maleFarmVisits * 100) /
        this.visitStats.totalFarmersVisited;
      this.graph.data[1][1] =
        (this.visitStats.femaleFarmVisits * 100) /
        this.visitStats.totalFarmersVisited;
      this.loading = false;
    });
  }

  getGapAdoptionStats(body: any): void {
    this.loading = true;
    this.gapService.getGapsStats(body).subscribe((data) => {
      this.gapAdoptionStats = data.data;
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

  onChanges() {
    this.dashboardForm.controls.location
      .get("prov_id".toString())
      .valueChanges.subscribe((value) => {
        if (value != "") {
          this.locationChangeProvince(this.dashboardForm, value);
          this.currentSelectedLocation = {
            searchBy: "prov_id",
            locationId: value,
          };
          this.siteService
            .getZone({ prov_id: value, searchBy: "province" })
            .subscribe((data) => {
              if (data) {
                this.organisations = data.content.filter((org) =>
                  org.organizationRole.includes(1)
                );
              }
            });
        }
      });
    this.dashboardForm.controls.location
      .get("dist_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangDistrict(this.dashboardForm, value);
        this.currentSelectedLocation = {
          searchBy: "dist_id",
          locationId: value,
        };
        this.siteService
          .getZone({ dist_id: value, searchBy: "district" })
          .subscribe((data) => {
            if (data) {
              this.organisations = data.content.filter((org) =>
                org.organizationRole.includes(1)
              );
            }
          });
      });
    this.dashboardForm.controls.location
      .get("sect_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangSector(this.dashboardForm, value);
        this.currentSelectedLocation = {
          searchBy: "sect_id",
          locationId: value,
        };
      });
    this.dashboardForm.controls.location
      .get("cell_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangCell(this.dashboardForm, value);
        this.currentSelectedLocation = {
          searchBy: "cell_id",
          locationId: value,
        };
      });

    this.dashboardForm.controls.training_id.valueChanges.subscribe((value) => {
      let body: any = {
        trainingId: value,
      };
      this.getTrainingsStats(body);
    });

    this.dashboardForm.controls.season_id.valueChanges.subscribe((value) => {
      this.dateRangeMin = `${parseFloat(value) - 1}-10-01`;
      this.dateRangeMax = `${value}-09-31`;
      this.dashboardForm.controls.filterByDate.setValue([
        `${parseFloat(value) - 1}-10-01`,
        `${value}-10-01`,
      ]);
    });

    this.dashboardForm.controls.quarterId.valueChanges.subscribe((value) => {
      let current =
        this.dashboardForm.value.season_id != ""
          ? this.dashboardForm.value.season_id
          : this.currentSeasonYear;
      if (value == 1) {
        this.dateRangeMin = `${parseFloat(current) - 1}-10-01`;
        this.dateRangeMax = `${current}-01-01`;
        this.dashboardForm.controls.filterByDate.setValue([
          `${parseFloat(current) - 1}-10-01`,
          `${current}-01-01`,
        ]);
      } else if (value == 2) {
        this.dateRangeMin = `${current}-01-01`;
        this.dateRangeMax = `${current}-04-01`;
        this.dashboardForm.controls.filterByDate.setValue([
          `${current}-01-01`,
          `${current}-04-01`,
        ]);
      } else if (value == 3) {
        this.dateRangeMin = `${current}-04-01`;
        this.dateRangeMax = `${current}-07-01`;
        this.dashboardForm.controls.filterByDate.setValue([
          `${current}-04-01`,
          `${current}-07-01`,
        ]);
      } else if (value == 4) {
        this.dateRangeMin = `${current}-07-01`;
        this.dateRangeMax = `${current}-10-01`;
        this.dashboardForm.controls.filterByDate.setValue([
          `${current}-07-01`,
          `${current}-10-01`,
        ]);
      }
    });

    this.dashboardForm.controls.filterByDate.valueChanges.subscribe((value) => {
      let selectedDate = [];
      if (value) {
        value.forEach((newData) => {
          selectedDate.push(this.formatDate(newData));
        });
      }
    });

    this.dashboardForm.controls.trainer_id.valueChanges.subscribe((value) => {
      let body: any = {
        trainerId: value,
      };
      if (this.dashboardForm.value.trainingId != "") {
        body.trainingId = this.dashboardForm.value.trainingId;
      }
      this.getTrainingsStats(body);
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

  enableFilter(value: boolean, type: string) {
    if (type == "training") {
      this.trainingFilterEnabled = value;
    } else if (type == "seedling") {
      this.seedlingFilterEnabled = value;
    } else if (type == "gap") {
      this.gapFilterEnabled = value;
    } else if (type == "visit") {
      this.visitFilterEnabled = value;
    }
  }
}
