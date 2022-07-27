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
import * as FileSaver from "file-saver";

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
  basePath: any;
  reportsTableData: any[] = [];
  reportBody: any;
  dataFile: any;
  reportGenerated: Boolean = false;

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
      filterByCws: this.formBuilder.group({
        cws: [""],
        sect_id: [""],
        cell_id: [""],
        village_id: [""],
      }),
      filterBySector: this.formBuilder.group({
        sect_id: [""],
        cell_id: [""],
        village_id: [""],
        farmer_group: [""],
      }),
      seasonFilters: this.formBuilder.group({
        startDate: [""],
        endDate: [""],
        seasons: [""],
      }),
      trainingFilters: this.formBuilder.group({
        trainingModule: [""],
        status: [""],
        gender: [""],
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
    this.reportForm.get("reportFor").valueChanges.subscribe((value) => {
      this.reportBody = {};
      if (value === "Farmer Groups") {
        this.reportService.groupStats({}).subscribe((data) => {
          this.stats = data.data[0];
        });
      }
    });
    this.reportForm.controls.location
      .get("prov_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangeProvince(this.reportForm, value);
        this.reportBody.location = {
          prov_id: value,
        };
        this.reportService
          .groupStats({
            location: {
              prov_id: value,
            },
          })
          .subscribe((data) => {
            this.stats = data.data[0];
            console.log(this.stats);
          });
      });
    this.reportForm.controls.location
      .get("dist_id".toString())
      .valueChanges.subscribe((value) => {
        this.reportBody.location = {
          dist_id: value,
        };
        this.locationChangDistrict(this.reportForm, value);
        this.reportService
          .groupStats({
            location: {
              dist_id: value,
            },
          })
          .subscribe((data) => {
            this.stats = data.data[0];
            console.log(this.stats);
          });
      });
    this.reportForm.controls.location
      .get("sect_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangSector(this.reportForm, value);
      });
  }

  downloadCsv() {
    this.generateFinalReport("application/xslx", ".xslx");
  }
  downloadPdf() {
    this.generateFinalReport("application/pdf", ".pdf");
  }
  downloadExcel() {
    this.generateFinalReport("application/pdf", ".pdf");
  }

  download(type: string, extension: string, filePath: any) {
    console.log(filePath);
    const byteArray = new Uint8Array(
      atob(filePath.split(",")[1])
        .split("")
        .map((char) => char.charCodeAt(0))
    );
    const newBlob = new Blob([byteArray], { type: type.toString() });
    const linkElement = document.createElement("a");
    const url = URL.createObjectURL(newBlob);
    linkElement.setAttribute("href", url);
    linkElement.setAttribute("download", "lab-results" + extension.toString());
    const clickEvent = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: false,
    });
    linkElement.dispatchEvent(clickEvent);
  }

  generateReport() {
    if (this.reportForm.value.reportFor === "Farmer Groups") {
      this.reportService.groupSummary(this.reportBody).subscribe((data) => {
        this.reportsTableData = data.data;
        this.dtTrigger.next();
        this.reportGenerated = true;
      });

    }
  }

  generateFinalReport(type: string, extension: string) {
    if (this.reportForm.value.reportFor === "Farmer Groups") {
      this.reportService.groupDownload(this.reportBody).subscribe((data) => {
        // this.download(type, extension, data.data.file);
        this.dataFile = data.data.file;
        console.log(this.dataFile);
      });
    }
  }
}
