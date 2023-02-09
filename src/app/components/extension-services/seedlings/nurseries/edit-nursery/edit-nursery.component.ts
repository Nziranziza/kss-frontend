import { Component, OnInit } from "@angular/core";
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  AuthenticationService,
  BasicComponent,
  LocationService,
  OrganisationService,
  FarmService,
  SeedlingService,
  HelperService,
} from "src/app/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ScrollStrategy, ScrollStrategyOptions } from "@angular/cdk/overlay";
import { SuccessModalComponent } from "src/app/shared";

@Component({
  selector: "app-edit-nursery",
  templateUrl: "./edit-nursery.component.html",
  styleUrls: [
    "../../../schedules/training-scheduling-create/training-scheduling-create.component.css",
  ],
})
export class EditNurseryComponent extends BasicComponent implements OnInit {
  scrollStrategy: ScrollStrategy;
  constructor(
    private formBuilder: UntypedFormBuilder,
    protected locationService: LocationService,
    private authenticationService: AuthenticationService,
    private organisationService: OrganisationService,
    private farmService: FarmService,
    private seedlingService: SeedlingService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private readonly sso: ScrollStrategyOptions,
    private router: Router,
    private helper: HelperService,
    private modal: NgbModal
  ) {
    super(locationService, organisationService);
    this.scrollStrategy = this.sso.noop();
  }
  addNursery: UntypedFormGroup;
  editNursery: UntypedFormGroup;
  agronomist: any[] = [];
  treeVarieties: any[] = [{ name: "", _id: "" }];
  nurserySites: any[] = [];
  currentIndex = 0;
  id: string;
  oldDatas: any;

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
      stockData: new UntypedFormArray([], Validators.required),
      location: this.formBuilder.group({
        prov_id: [""],
        dist_id: [""],
        sect_id: [""],
        cell_id: [""],
        village_id: [""],
        latitude: [""],
        longitude: [""],
      }),
      totalSeedlings: [""],
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
          .setValue(datas.location.prov_id._id);
        this.addNursery.controls.location
          .get("dist_id".toString())
          .setValue(datas.location.dist_id._id);
        this.addNursery.controls.location
          .get("sect_id".toString())
          .setValue(datas.location.sect_id._id);
        this.addNursery.controls.location
          .get("cell_id".toString())
          .setValue(datas.location.cell_id._id);
        this.addNursery.controls.location
          .get("village_id".toString())
          .setValue(datas.location.village_id._id);
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
          (this.addNursery.controls.stockData as UntypedFormArray).push(
            this.formBuilder.group({
              variety: [
                item.varietyId._id,
                { value: item.varietyId._id, disabled: true },
              ],
              seed: [item.seeds, { value: item.seeds, disabled: true }],
              expectedSeedling: [
                { value: item.expectedSeedlings, disabled: true },
              ],
              prickedQty: item.prickedQty || 0,
              successRate: [
                { value: item.germinationRate || 0, disabled: true },
              ],
              germinationRate: item.germinationRate || "",
              distributed: [
                {
                  value: item.prickedQty - item.remainingQty || 0,
                  disabled: true,
                },
              ],
              id: item._id || "",
              pickingDate: [item.pickedDate || ""],
              sowingDate: [item.sowingDate || ""],
            }) as UntypedFormGroup
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
    return this.addNursery.get("stockData") as UntypedFormArray;
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
    (this.addNursery.controls.stockData as UntypedFormArray).push(this.createStock());
  }

  addStockItem() {
    if (
      this.treeVarieties.length >
      this.addNursery.controls.stockData.value.length
    ) {
      (this.addNursery.controls.stockData as UntypedFormArray).push(
        this.createStock()
      );
      this.currentIndex++;
    }
  }
  removeStockItem(index: number) {
    (this.addNursery.controls.stockData as UntypedFormArray).removeAt(index);
    this.currentIndex--;
  }
  createStock(): UntypedFormGroup {
    return this.formBuilder.group({
      variety: [this.treeVarieties[this.currentIndex]._id],
      seed: [0],
      expectedSeedling: [{ value: "", disabled: true }],
      recordedSeedling: [0],
      germinationRate: [{ value: "", disabled: true }],
      distributed: [{ value: "", disabled: true }],
      sowingDate: [""],
      prickedQty: [""],
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
    this.addNursery.controls.stockData.valueChanges.subscribe((value) => {
      value.forEach((item, i) => {
        if (item.prickedQty > 0) {
          item.germinationRate = this.getGermination(
            (item.prickedQty * 100) / (item.seed * 2500)
          );
          this.formData.controls[i]
            .get("germinationRate")
            .setValue(item.germinationRate, { emitEvent: false });
        }
      });
    });
  }

  getGermination(value: number) {
    let rate = "0-30";
    if (value >= 90) {
      rate = "90+";
    } else if (value < 90 && value >= 70) {
      rate = "70-90";
    } else if (value < 70 && value >= 50) {
      rate = "50-70";
    } else if (value < 50 && value >= 30) {
      rate = "30-50";
    }
    return rate;
  }

  onCreate() {
    this.addNursery.markAllAsTouched();
    if (this.addNursery.valid) {
      const data = {
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
        stocks: this.addNursery.value.stockData.map((newdata) => {
          const newData: any = {
            _id: newdata.id,
            seeds: newdata.seed,
            varietyId: newdata.variety,
          };
          newdata.germinationRate !== ""
            ? (newData.germinationRate = newdata.germinationRate)
            : "";
          newdata.variety !== "" ? (newData.varietyId = newdata.variety) : "";
          newdata.prickedQty !== ""
            ? (newData.prickedQty = newdata.prickedQty)
            : "";
          newdata.pickingDate !== ""
            ? (newData.pickedDate = newdata.pickingDate)
            : "";
          newdata.sowingDate !== ""
            ? (newData.sowingDate = newdata.sowingDate)
            : "";
          return newData;
        }),
      };
      this.seedlingService.update(this.id, data).subscribe(
        (results) => {
          this.loading = false;
          this.success(results.data.nurseryName);
        },
        (err) => {
          this.loading = false;
          this.errors = err.errors;
        }
      );
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

  success(name) {
    const modalRef = this.modal.open(SuccessModalComponent, {
      ariaLabelledBy: "modal-basic-title",
    });
    modalRef.componentInstance.message = "has been updated successfully";
    modalRef.componentInstance.title = "Thank you Nursery";
    modalRef.componentInstance.name = name;
    modalRef.result.finally(() => {
      this.router.navigateByUrl("admin/seedling/nursery/list");
    });
  }
}
