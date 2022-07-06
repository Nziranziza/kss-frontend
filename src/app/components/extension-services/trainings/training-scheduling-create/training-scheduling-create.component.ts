import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  TrainingService,
  Training,
  BasicComponent,
  LocationService,
  HelperService,
  AuthenticationService,
} from "../../../../core";
import { isEmptyObject } from "jquery";

@Component({
  selector: "app-training-scheduling-create",
  templateUrl: "./training-scheduling-create.component.html",
  styleUrls: ["./training-scheduling-create.component.css"],
})
export class TrainingSchedulingCreateComponent
  extends BasicComponent
  implements OnInit
{
  scheduleTraining: FormGroup;
  filterForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private trainingService: TrainingService,
    protected locationService: LocationService,
    private helper: HelperService,
    private authenticationService: AuthenticationService
  ) {
    super(locationService);
  }

  trainings: Training[] = [];
  searchByLocation = true;
  parameters: any;
  errors: any;
  provinces: any;
  loading = false;
  org: any;
  searchResults: any;

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
    });
    this.parameters = {
      length: 10,
      start: 0,
      draw: 1,
      org_id: this.authenticationService.getCurrentUser().info.org_id
    };
    this.filterForm = this.formBuilder.group({
      searchOption: ['location'],
      searchByLocation: this.formBuilder.group({
        searchBy: ['farmer_location'],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
      searchByTerm: this.formBuilder.group({
        term: ['', Validators.minLength(3)],
        searchBy: ['reg_number'],
      }),
    });
    this.basicInit(this.authenticationService.getCurrentUser().info.org_id);
    this.onChanges();
  }

  getGroups(): void {
    this.loading = true;
    this.trainingService.all().subscribe((data) => {
      this.trainings = data.data;
      console.log(this.trainings);
      this.loading = false;
    });
  }

  open(content) {
    this.modalService.open(content, { ariaLabelledBy: "modal-basic-title" });
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
    this.filterForm.controls.searchOption.valueChanges.subscribe((value) => {
      if (value !== "" && value === "location") {
        this.searchByLocation = true;
        this.filterForm.controls.searchByTerm.get("term").setValue("");
      } else {
        this.filterForm.controls.searchByLocation
          .get("sect_id".toString())
          .setValue("", { emitEvent: false });
        this.filterForm.controls.searchByLocation
          .get("cell_id".toString())
          .setValue("", { emitEvent: false });
        this.filterForm.controls.searchByLocation
          .get("village_id".toString())
          .setValue("", { emitEvent: false });
        this.searchByLocation = false;
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
  }
}
