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
      this.getStats(value, this.reportBody);
    });
    this.reportForm.controls.location
      .get("prov_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangeProvince(this.reportForm, value);
        this.reportBody.location = {
          prov_id: value,
        };
        this.getStats(this.reportForm.value.reportFor, {
          location: {
            prov_id: value,
          },
        });
      });
    this.reportForm.controls.location
      .get("dist_id".toString())
      .valueChanges.subscribe((value) => {
        this.reportBody.location = {
          dist_id: value,
        };
        this.locationChangDistrict(this.reportForm, value);
        this.getStats(this.reportForm.value.reportFor, {
          location: {
            dist_id: value,
          },
        });
      });
    this.reportForm.controls.location
      .get("sect_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangSector(this.reportForm, value);
      });
  }

  getStats(value: any, body: any) {
    if (value === "Farmer Groups") {
      this.reportService.groupStats(body).subscribe((data) => {
        this.stats = data.data[0];
      });
    } else if (value === "Trainings") {
      this.reportService.trainingStats(body).subscribe((data) => {
        this.stats = data.data[0];
      });
    } else if (value === "Farm Visits") {
      this.reportService.visitStats(body).subscribe((data) => {
        this.stats = data.data[0];
      });
    }
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
    } else if (this.reportForm.value.reportFor === "Trainings") {
      this.reportService.trainingSummary(this.reportBody).subscribe((data) => {
        this.reportsTableData = data.data;
        this.dtTrigger.next();
        this.reportGenerated = true;
      });
    } else if (this.reportForm.value.reportFor === "Farm Visits") {
      this.reportService.visitSummary(this.reportBody).subscribe((data) => {
        this.reportsTableData = data.data;
        this.dtTrigger.next();
        this.reportGenerated = true;
      });
    }
  }

  generateFinalReport(type: string, extension: string) {
    if (this.reportForm.value.reportFor === "Farmer Groups") {
      this.reportService.groupDownload(this.reportBody).subscribe((data) => {
        this.dataFile = data.data.file;
      });
    } else if (this.reportForm.value.reportFor === "Trainings") {
      this.reportService.trainingDownload(this.reportBody).subscribe((data) => {
        this.dataFile = data.data.file;
      });
    } else if (this.reportForm.value.reportFor === "Farm Visits") {
      this.reportService.visitDownload(this.reportBody).subscribe((data) => {
        this.dataFile = data.data.file;
      });
    }
  }
}
