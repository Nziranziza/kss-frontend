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
} from "src/app/core";

@Component({
  selector: "app-nursery-create",
  templateUrl: "./nursery-create.component.html",
  styleUrls: [
    "../../../schedules/training-scheduling-create/training-scheduling-create.component.css",
  ],
})
export class NurseryCreateComponent extends BasicComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    protected locationService: LocationService,
    private authenticationService: AuthenticationService,
    private organisationService: OrganisationService,
    private farmService: FarmService,
    private seedlingService: SeedlingService,
    private modalService: NgbModal
  ) {
    super(locationService, organisationService);
  }
  addNursery: FormGroup;
  agronomist: any[] = [];
  treeVarieties: any[] = [{ name: "", _id: "" }];
  nurserySites: any[] = [];
  currentIndex: number = 0;

  ngOnInit() {
    this.addNursery = this.formBuilder.group({
      nurseryName: ["", Validators.required],
      owner: ["", Validators.required],
      siteAvailability: [""],
      description: ["", Validators.required],
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
      totalSeedlings: ["", Validators.required],
      adoptionGap: ["", Validators.required],
      status: [""],
      date: this.formBuilder.group({
        visitDate: [""],
        startTime: [""],
        endTime: [""],
      }),
      startTime: "00:00",
      endTime: "00:00",
    });
    this.getTreeVariety();
    this.basicInit(this.authenticationService.getCurrentUser().info.org_id);
    this.getNurserySites();
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
  }
  createStock(): FormGroup {
    return this.formBuilder.group({
      variety: [this.treeVarieties[this.currentIndex]._id],
      seed: [""],
      expectedSeedling: [{ value: "", disabled: true }],
      recordedSeedling: [""],
      germinationRate: [{ value: "", disabled: true }],
      distributed: [{ value: "", disabled: true }],
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
    let data = {
      nurseryName: this.addNursery.value.nurseryName,
      owner: {
        name: "Big Boss",
        phoneNumber: "250780348088",
      },
      representative: {
        name: "Big Boss",
        phoneNumber: "250780348088",
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
      stocks: [
        {
          varietyId: "626bb0a85d5a18a1b38dd5ca",
          seeds: 1,
        },
      ],
    };
    this.seedlingService.create(data).subscribe((data) => {
      this.addNursery.reset();
      this.getNurserySites();
    });
  }

  onUpdate() {
    let data = {
      _id: "62ce75c0f953f3052819f68e",
      nurseryName: "Nursery Name: Updated",
      owner: {
        _id: "62cd9f17713f384d9015abd6",
        name: "Big Boss",
        phoneNumber: "250780348088",
      },
      representative: {
        _id: "62cd9f17713f384d9015abd7",
        name: "Big Boss",
        phoneNumber: "250780348088",
      },
      org_id: "5d1f36dae6950c4d9eaffa37",
      latitude: "2.4494949",
      longitude: "9.955959",
      location: {
        prov_id: "5bf8170953d485a9eae4b41c",
        dist_id: "5bf8171e53d485a9eae4b421",
        sect_id: "5bfd8dbe91703530fcb9b1dd",
        cell_id: "5bf816d753d485a9eae4aa7f",
        village_id: "5bf8163553d485a9eae42ef5",
      },
      stocks: [
        {
          _id: "62ce75c0f953f3052819f692",
          varietyId: "626bb0a85d5a18a1b38dd5ca",
          seeds: 3,
          seedlingQty: 2500,
        },
        {
          varietyId: "626bc0fc2c09eeafbfb787ea",
          seeds: 2,
          seedlingQty: 2500,
        },
      ],
    };
    this.seedlingService.update(data._id, data).subscribe((data) => {
      this.addNursery.reset();
      this.getNurserySites();
    });
  }

  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: "modal-basic-title",
      size: "lg",
    });
  }
}
