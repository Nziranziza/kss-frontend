import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  AuthenticationService,
  BasicComponent,
  LocationService,
  OrganisationService,
  FarmService,
  SeedlingService,
  TrainingService,
  UserService,
  VisitService,
  GapService,
  HelperService,
} from "src/app/core";
import { Router } from "@angular/router";
import { ScrollStrategy, ScrollStrategyOptions } from "@angular/cdk/overlay";
@Component({
  selector: "app-nursery-create",
  templateUrl: "./nursery-create.component.html",
  styleUrls: [
    "../../../schedules/training-scheduling-create/training-scheduling-create.component.css",
  ],
})
export class NurseryCreateComponent extends BasicComponent implements OnInit {
  scrollStrategy: ScrollStrategy;
  constructor(
    private formBuilder: FormBuilder,
    protected locationService: LocationService,
    private authenticationService: AuthenticationService,
    private organisationService: OrganisationService,
    private farmService: FarmService,
    private seedlingService: SeedlingService,
    private modalService: NgbModal,
    private router: Router,
    private readonly sso: ScrollStrategyOptions,
    private helper: HelperService
  ) {
    super(locationService, organisationService);
    this.scrollStrategy = this.sso.noop();
  }
  addNursery: FormGroup;
  editNursery: FormGroup;
  agronomist: any[] = [];
  treeVarieties: any[] = [{ name: "", _id: "" }];
  nurserySites: any[] = [];
  currentIndex: number = 0;

  ngOnInit() {
    this.addNursery = this.formBuilder.group({
      nurseryName: ["", Validators.required],
      ownerName: ["", Validators.required],
      ownerNumber: ["", [Validators.required, Validators.pattern("[0-9]{12}")]],
      representativeName: ["", Validators.required],
      representativeNumber: [
        "",
        [Validators.required, Validators.pattern("[0-9]{12}")],
      ],
      siteAvailability: ["no"],
      agronomist: [""],
      stockData: new FormArray([], Validators.required),
      location: this.formBuilder.group({
        prov_id: [""],
        dist_id: [""],
        sect_id: [""],
        cell_id: [""],
        village_id: [""],
        latitude: [""],
        longitude: [""],
      }),
      status: [""],
    });
    this.getTreeVariety();
    this.basicInit(this.authenticationService.getCurrentUser().info.org_id);
    this.getNurserySites();
    this.addStockItem();
    this.onChanges();
  }

  get formData() {
    return this.addNursery.get("stockData") as FormArray;
  }

  getTreeVariety() {
    this.farmService.listTreeVarieties().subscribe((data) => {
      this.treeVarieties = data.data;
    });
  }

  getNurserySites() {
    this.seedlingService.all().subscribe((data) => {
      this.nurserySites = data.data;
    });
  }
  addFirstStockItem() {
    (this.addNursery.controls.stockData as FormArray).push(this.createStock());
  }

  addStockItem() {
    if (
      this.treeVarieties.length >
      this.addNursery.controls.stockData.value.length
    ) {
      (this.addNursery.controls.stockData as FormArray).push(
        this.createStock()
      );
      this.currentIndex++;
    }
  }
  removeStockItem(index: number) {
    (this.addNursery.controls.stockData as FormArray).removeAt(index);
    this.currentIndex--;
  }
  createStock(): FormGroup {
    return this.formBuilder.group({
      variety: [this.treeVarieties[this.currentIndex]._id],
      seed: [0],
      expectedSeedling: [{ value: "", disabled: true }],
      recordedSeedling: [{ value: 0, disabled: true }],
      germinationRate: [{ value: "", disabled: true }],
      distributed: [{ value: 0, disabled: true }],
      sowingDate: [""],
    });
  }

  onChanges() {
    this.addNursery.controls.location
      .get("prov_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangeProvince(this.addNursery, value);
      });
    this.addNursery.controls.location
      .get("dist_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangDistrict(this.addNursery, value);
      });
    this.addNursery.controls.ownerNumber.valueChanges.subscribe((value) => {
      if (value === "07") {
        this.addNursery.controls.ownerNumber.setValue("2507");
      }
    });
    this.addNursery.controls.representativeNumber.valueChanges.subscribe(
      (value) => {
        if (value === "07") {
          this.addNursery.controls.representativeNumber.setValue("2507");
        }
      }
    );
    this.addNursery.controls.location
      .get("sect_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangSector(this.addNursery, value);
      });
    this.addNursery.controls.location
      .get("cell_id".toString())
      .valueChanges.subscribe((value) => {
        this.locationChangCell(this.addNursery, value);
      });
  }

  onCreate() {
    if (this.addNursery.valid) {
      let data = {
        nurseryName: this.addNursery.value.nurseryName,
        owner: {
          name: this.addNursery.value.ownerName,
          phoneNumber: this.addNursery.value.ownerNumber,
        },
        representative: {
          name: this.addNursery.value.representativeName,
          phoneNumber: this.addNursery.value.representativeNumber,
        },
        org_id: this.authenticationService.getCurrentUser().info.org_id,
        latitude: this.addNursery.value.location.latitude,
        longitude: this.addNursery.value.location.longitude,
        location: {
          prov_id: this.addNursery.value.location.prov_id,
          dist_id: this.addNursery.value.location.dist_id,
          sect_id: this.addNursery.value.location.sect_id,
          cell_id: this.addNursery.value.location.cell_id,
          village_id: this.addNursery.value.location.village_id,
        },
        stocks: this.addNursery.value.stockData.map((data) => {
          return {
            varietyId: data.variety,
            seeds: data.seed,
            sowingDate: data.sowingDate,
          };
        }),
      };
      this.seedlingService.create(data).subscribe((data) => {
        this.router.navigateByUrl("admin/seedling/nursery/list");
      });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.addNursery);
    }
  }

  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: "modal-basic-title",
      size: "lg",
    });
  }
}
