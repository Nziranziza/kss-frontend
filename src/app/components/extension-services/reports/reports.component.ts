import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import {
  AuthenticationService,
  BasicComponent,
  LocationService,
  OrganisationService,
  ReportService,
  SeasonService,
} from "src/app/core";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.css"],
})
export class ReportsComponent extends BasicComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private seasonService: SeasonService,
    private authenticationService: AuthenticationService,
    private locationService: LocationService,
    private organisationService: OrganisationService,
    private reportService: ReportService
  ) {
    super(locationService, organisationService);
  }
  loading = false;
  reportForm: FormGroup;
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  groups: any[] = [];
  seasons: any[] = [];
  currentSeason: any;
  stats: any;

  ngOnInit() {
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
    };
    this.reportForm = this.formBuilder.group({
      filterByType: [""],
      reportFor: [""],
      location: this.formBuilder.group({
        prov_id: [""],
        dist_id: [""],
        sect_id: [""],
      }),
      date: this.formBuilder.group({
        visitDate: [""],
        startTime: [""],
        endTime: [""],
      }),
    });
    this.seasonService.all().subscribe((data) => {
      this.seasons = data.content;
      this.currentSeason = this.authenticationService.getCurrentSeason();
    });
    this.basicInit(this.authenticationService.getCurrentUser().info.org_id);
    this.onChanges();
  }

  onChanges() {
    this.reportForm.controls.location
      .get("prov_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangeProvince(this.reportForm, value);
      });
    this.reportForm.controls.location
      .get("dist_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangDistrict(this.reportForm, value);
        console.log(value);
        this.reportService
          .groupStats({
            reference: this.authenticationService.getCurrentUser().info.org_id,
            location: {
              dist_id: value,
            },
          })
          .subscribe((data) => {
            this.stats = data.data;
            console.log(this.stats);
          });
      });
    this.reportForm.controls.location
      .get("sect_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangSector(this.reportForm, value);
      });
  }
}
