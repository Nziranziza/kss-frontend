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
} from "src/app/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-edit-nursery",
  templateUrl: "./edit-nursery.component.html",
  styleUrls: [
    "../../../schedules/training-scheduling-create/training-scheduling-create.component.css",
  ],
})
export class EditNurseryComponent extends BasicComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    protected locationService: LocationService,
    private authenticationService: AuthenticationService,
    private organisationService: OrganisationService,
    private farmService: FarmService,
    private seedlingService: SeedlingService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private router: Router
  ) {
    super(locationService, organisationService);
  }
  addNursery: FormGroup;
  editNursery: FormGroup;
  agronomist: any[] = [];
  treeVarieties: any[] = [{ name: "", _id: "" }];
  nurserySites: any[] = [];
  currentIndex: number = 0;
  id: string;
  oldDatas: any;

  ngOnInit() {
    this.addNursery = this.formBuilder.group({
      nurseryName: ["", Validators.required],
      ownerName: ["", Validators.required],
      ownerNumber: ["", Validators.required],
      representativeName: ["", Validators.required],
      representativeNumber: ["", Validators.required],
      siteAvailability: ["no"],
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
    });
    this.route.params.subscribe((params) => {
      this.id = params["id".toString()];
      this.seedlingService.one(params["id".toString()]).subscribe((data) => {
        const datas = data.data;
        this.oldDatas = datas;
        this.addNursery
          .get("nurseryName".toString())
          .setValue(datas.nurseryName, { emitEvent: false });
        this.addNursery.controls.location
          .get("prov_id".toString())
          .setValue(datas.location.prov_id._id, { emitEvent: false });
        this.addNursery.controls.location
          .get("dist_id".toString())
          .setValue(datas.location.dist_id._id, { emitEvent: false });
        this.addNursery.controls.location
          .get("sect_id".toString())
          .setValue(datas.location.sect_id._id, { emitEvent: false });
        this.addNursery.controls.location
          .get("cell_id".toString())
          .setValue(datas.location.cell_id._id, { emitEvent: false });
        this.addNursery.controls.location
          .get("village_id".toString())
          .setValue(datas.location.village_id._id, { emitEvent: false });
        this.addNursery.controls.location
          .get("latitude".toString())
          .setValue(datas.latitude, { emitEvent: false });
        this.addNursery.controls.location
          .get("longitude".toString())
          .setValue(datas.longitude, { emitEvent: false });
        this.addNursery
          .get("ownerName".toString())
          .setValue(datas.owner.name, { emitEvent: false });
        this.addNursery
          .get("ownerNumber".toString())
          .setValue(datas.owner.phoneNumber, { emitEvent: false });
        this.addNursery
          .get("representativeName".toString())
          .setValue(datas.representative.name, { emitEvent: false });
        this.addNursery
          .get("representativeNumber".toString())
          .setValue(datas.representative.phoneNumber, { emitEvent: false });
        datas.stocks.map((item) => {
          (this.addNursery.controls.stockData as FormArray).push(
            this.formBuilder.group({
              variety: [item.varietyId._id, { value: item.varietyId._id, disabled: true }],
              seed: [item.seeds, { value: item.seeds, disabled: true }],
              expectedSeedling: [
                { value: item.expectedSeedlings, disabled: true },
              ],
              prickedQty: item.prickedQty || 0,
              successRate: [
                { value: item.germinationRate || 0, disabled: true },
              ],
              germinationRate: item.germinationRate || "",
              distributed: [{ value: item.distributed || 0, disabled: true }],
              id: item._id || "",
              
            }) as FormGroup
          );
        });
      });
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
    this.currentIndex--;
  }
  createStock(): FormGroup {
    return this.formBuilder.group({
      variety: [this.treeVarieties[this.currentIndex]._id],
      seed: [0],
      expectedSeedling: [{ value: "", disabled: true }],
      recordedSeedling: [0],
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
      _id: this.id,
      nurseryName: this.addNursery.value.nurseryName,
      owner: {
        _id: this.oldDatas.owner._id,
        name: this.addNursery.value.ownerName,
        phoneNumber: this.addNursery.value.ownerNumber,
      },
      representative: {
        _id: this.oldDatas.representative._id,
        name: this.addNursery.value.representativeName,
        phoneNumber: this.addNursery.value.representativeNumber,
      },
      org_id: this.authenticationService.getCurrentUser().info.org_id,
      latitude: this.addNursery.value.location.latitude,
      longitude: this.addNursery.value.location.longitude,
      location: {
        _id: this.oldDatas.location._id,
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
          _id: data.id,
          prickedQty: data.prickedQty,
          germinationRate: data.germinationRate,
        };
      }),
    };
    this.seedlingService.update(this.id, data).subscribe((data) => {
      this.router.navigateByUrl("admin/seedling/nursery/list");
    });
  }

  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: "modal-basic-title",
      size: "lg",
    });
  }
}
