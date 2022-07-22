import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ChartType } from "angular-google-charts";
import {
  AuthenticationService,
  BasicComponent,
  GapService,
  LocationService,
  OrganisationService,
  TrainingService,
  UserService,
  VisitService,
} from "src/app/core";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
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
    private gapService: GapService
  ) {
    super(locationService, organisationService);
  }

  dashboardForm: FormGroup;
  graph = {
    type: ChartType.PieChart,
    data: [
      ["Male", 70],
      ["Female", 30],
    ],
    options: {
      colors: ["#35A1FF", "#FF69F6"],
      legend: { position: "none" },
      pieHole: 0.4,
      backgroundColor: { fill: "transparent" },
    },
    columnNames: ["male", "female"],
    width: 150,
    height: 150,
  };

  seedlingGraph = {
    type: ChartType.PieChart,
    data: [
      ["Variety1", 40],
      ["Variety2", 60],
    ],
    options: {
      colors: ["#F5B23F", "#FF990A"],
      legend: { position: "none" },
      pieHole: 0.2,
      backgroundColor: { fill: "transparent" },
    },
    columnNames: ["Variety1", "Variety2"],
    width: 200,
    height: 160,
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
  visitStats: any = { femaleFarmVisits: 0, maleFarmVisits: 0, totolVisits: 0 };
  gapAdoptionStats: any[] = [];
  seedlingStats: any[] = [];

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
    });
    this.basicInit(this.authenticationService.getCurrentUser().info.org_id);
    this.onChanges();
    this.getTrainers();
    this.getTrainings();
    this.getTrainingsStats({});
    this.getGapAdoptionStats({});
    this.getVisitsStats({});
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
    name: string;
    trees: string;
    visits: number;
  }[] = [
    {
      id: 1,
      lat: -1.9485423,
      lng: 30.0613514,
      name: "Rugero Farm",
      trees: "10",
      visits: 10,
    },
    {
      id: 2,
      lat: -2.146385,
      lng: 30.131367,
      name: "Kigl Farm",
      trees: "20",
      visits: 20,
    },
    {
      id: 3,
      lat: -2.115194,
      lng: 30.11542,
      name: "Jk Farm",
      trees: "30",
      visits: 30,
    },
    {
      id: 4,
      lat: -1.898489,
      lng: 30.19131,
      name: "uio farm",
      trees: "40",
      visits: 40,
    },
  ];

  selectMarker(spot: { id: number; lat: number; lng: number; name: string }) {
    this.selectedFarmDetails = spot;
    this.clickedMarker = true;
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

  getVisitsStats(body: any): void {
    this.loading = true;
    console.log(this.graph.data[0][1]);
    this.visitService.getVisitsStats(body).subscribe((data) => {
      this.visitStats = data.data;
      this.graph.data[0][1] = this.visitStats.maleFarmVisits * 100 / this.visitStats.totolVisits;
      this.graph.data[1][1] = this.visitStats.femaleFarmVisits * 100 / this.visitStats.totolVisits;
      
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
        this.locationChangeProvince(this.dashboardForm, value);
      });
    this.dashboardForm.controls.location
      .get("dist_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangDistrict(this.dashboardForm, value);
      });
    this.dashboardForm.controls.location
      .get("sect_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangSector(this.dashboardForm, value);
      });
    this.dashboardForm.controls.location
      .get("cell_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangCell(this.dashboardForm, value);
      });

    this.dashboardForm.controls.training_id.valueChanges.subscribe((value) => {
      let body = {
        trainingId: value,
      };
      this.getTrainingsStats(body);
    });

    this.dashboardForm.controls.trainer_id.valueChanges.subscribe((value) => {
      let body = {
        trainerId: value,
      };
      this.getTrainingsStats(body);
    });
  }
}
