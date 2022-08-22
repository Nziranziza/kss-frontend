import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import {
  AuthenticationService,
  BasicComponent,
  GroupService,
  LocationService,
  OrganisationService,
  ReportService,
  SeasonService,
  TrainingService,
} from "src/app/core";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.css"],
})
export class ReportsComponent extends BasicComponent implements OnInit {
  newOrg: any;
  coveredSectors: any = [];
  coveredVillages: any = [];
  coveredCells: any = [];
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
    private reportService: ReportService
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
  seasons: any[] = [];
  currentSeason: any;
  stats: any = {};
  basePath: any;
  reportsTableData: any[] = [];
  organisations: any[] = [];
  trainings: any[] = [];
  reportBody: any;
  dataFile: any;
  reportGenerated: Boolean = false;
  showHeaders: Boolean = false;
  initialValue = "";
  sectorIndex: number = 0;
  keyword = "organizationName";
  groupKeyword = "groupName";
  weekDays: string[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  ngOnInit() {
    this.dtOptions,
      this.dt2Options,
      this.dt3Options,
      (this.dt4Options = {
        pagingType: "full_numbers",
        pageLength: 10,
      });
    this.reportForm = this.formBuilder.group({
      filterByType: [""],
      reportFor: [""],
      location: this.formBuilder.group({
        prov_id: [""],
        dist_id: [""],
        sect_id: [""],
        cell_id: [""],
        village_id: [""],
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
    this.initial();
    this.onChanges();
  }

  initial() {
    this.getTrainings();
    this.getOrganisations();
    this.getFarmerGroup();
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
        this.organisations = data.content.filter((org) =>
          org.organizationRole.includes(1)
        );
        this.organisations.unshift({
          organizationName: "all organizations",
          _id: "",
        });
      }
    });
  }

  getFarmerGroup() {
    this.loading = true;
    this.groupService.all({}).subscribe((data) => {
      this.groups = data.data;
      this.groups.unshift({ groupName: "all groups", _id: "" });
      this.loading = false;
    });
  }

  selectEvent(item) {
    this.newOrg = item._id;
    let newData = this.organisations.filter((org) => org._id === item._id);
    console.log(newData);
    this.coveredSectors = newData[0].coveredSectors;
    this.coveredCells =
      newData[0].coveredSectors[this.sectorIndex].coveredCells;
    this.coveredVillages =
      newData[0].coveredSectors[this.sectorIndex].coveredVillages;
  }

  deselectEvent() {
    this.newOrg = "";
  }

  selectGroupEvent(item) {
    this.selectedGroup = item._id;
  }

  deselectGroupEvent(item) {
    this.selectedGroup = "";
  }

  onChanges() {
    this.reportForm.get("reportFor").valueChanges.subscribe((value) => {
      this.reportBody = {};
      this.stats = {};
      this.reportsTableData = [];
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
        this.getStats(this.reportForm.value.reportFor, {
          location: {
            sect_id: value,
          },
        });
      });

    this.reportForm.controls.location
      .get("cell_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangCell(this.reportForm, value);
        this.getStats(this.reportForm.value.reportFor, {
          location: {
            cell_id: value,
          },
        });
      });

    this.reportForm.controls.location
      .get("village_id".toString())
      .valueChanges.subscribe((value) => {
        this.getStats(this.reportForm.value.reportFor, {
          location: {
            village_id: value,
          },
        });
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
    this.generateFinalReport();
  }

  downloadFile() {
    let data = this.dataCsv;
    console.log(data);
    const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
    const header = Object.keys(data[0]);
    let csv = data.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(",")
    );
    csv.unshift(header.join(","));
    let csvArray = csv.join("\r\n");

    var blob = new Blob([csvArray], { type: "text/csv" });
    saveAs(blob, "myFile.csv");
  }

  downloadPdfFile() {
    let base64String = this.dataPdf;
    console.log(base64String);
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = `sks-report.pdf`;
    link.click();
  }

  downloadPdf() {
    this.showHeaders = true;
    html2canvas(document.getElementById("downloadFile")).then((canvas) => {
      // Few necessary setting options
      let imgWidth = 208;
      let pageHeight = 295;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL("image/png");
      let pdf = new jsPDF("p", "mm", "a4"); // A4 size page of PDF
      let position = 0;
      pdf.addImage(contentDataURL, "PNG", 0, position, imgWidth, imgHeight);
      pdf.save("sks-report.pdf"); // Generated PDF
    });
    this.showHeaders = false;
  }

  generateReport() {
    if (this.reportForm.value.reportFor === "Farmer Groups") {
      this.reportsTableData = [];
      this.reportService.groupSummary(this.reportBody).subscribe((data) => {
        this.reportsTableData = data.data;
        this.dtTrigger.next();
        this.reportGenerated = true;
      });
    } else if (this.reportForm.value.reportFor === "Trainings") {
      this.reportsTableData = [];
      this.reportService.trainingSummary(this.reportBody).subscribe((data) => {
        this.reportsTableData = data.data;
        this.dt2Trigger.next();
        this.reportGenerated = true;
      });
    } else if (this.reportForm.value.reportFor === "Farm Visits") {
      this.reportsTableData = [];
      this.reportService.visitSummary(this.reportBody).subscribe((data) => {
        this.reportsTableData = data.data;
        this.dt3Trigger.next();
        this.reportGenerated = true;
      });
    }
  }

  generateFinalReport() {
    if (this.reportForm.value.reportFor === "Farmer Groups") {
      this.reportService
        .groupDownload(this.reportBody, "xlsx")
        .subscribe((data) => {
          this.dataFile = data.data.file;
        });
      this.reportService
        .groupDownload(this.reportBody, "csv")
        .subscribe((data) => {
          this.dataCsv = data.data.file;
        });
      this.reportService
        .groupDownload(this.reportBody, "pdf")
        .subscribe((data) => {
          this.dataPdf = data.data.file;
        });
    } else if (this.reportForm.value.reportFor === "Trainings") {
      this.reportService
        .trainingDownload(this.reportBody, "xlsx")
        .subscribe((data) => {
          this.dataFile = data.data.file;
        });
      this.reportService
        .trainingDownload(this.reportBody, "csv")
        .subscribe((data) => {
          this.dataCsv = data.data.file;
        });
      this.reportService
        .trainingDownload(this.reportBody, "pdf")
        .subscribe((data) => {
          this.dataPdf = data.data.file;
        });
    } else if (this.reportForm.value.reportFor === "Farm Visits") {
      this.reportService
        .visitDownload(this.reportBody, "xlsx")
        .subscribe((data) => {
          this.dataFile = data.data.file;
        });
      this.reportService
        .visitDownload(this.reportBody, "csv")
        .subscribe((data) => {
          this.dataCsv = data.data.file;
        });
      this.reportService
        .visitDownload(this.reportBody, "pdf")
        .subscribe((data) => {
          this.dataPdf = data.data.file;
        });
    }
  }
}
