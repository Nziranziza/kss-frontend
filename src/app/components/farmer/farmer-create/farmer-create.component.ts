import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AuthenticationService,
  ConfirmDialogService,
  FarmerService,
  FarmService,
  OrganisationService,
  SiteService,
} from "../../../core";
import { LocationService } from "../../../core";
import { UserService } from "../../../core";
import { MessageService } from "../../../core";
import { HelperService } from "../../../core";
import { isArray, isUndefined } from "util";
import { AuthorisationService } from "../../../core";
import { Location } from "@angular/common";
import { BasicComponent } from "../../../core";

@Component({
  selector: "app-farmer-create",
  templateUrl: "./farmer-create.component.html",
  styleUrls: ["./farmer-create.component.css"],
})
export class FarmerCreateComponent
  extends BasicComponent
  implements OnInit, OnDestroy
{
  createForm: FormGroup;
  provinces: any = [];
  districts: any = [];
  sectors: any = [];
  cells: any = [];
  villages: any = [];
  addressProvinces: any;
  addressDistricts: any;
  addressSectors: any;
  addressCells: any;
  addressVillages: any;
  requestIndex = 0;
  farmer: any;
  createFromPending = false;
  isGroup = false;
  id: string;
  submit = false;
  loading = false;
  invalidId = false;
  currentSeason: any;
  isUserCWSOfficer = false;
  isUserDistrictCashCrop = false;
  isUserSiteManager = false;
  user: any;
  site: any;
  org: any;
  disableProvId = true;
  disableDistId = true;
  provinceValue = "";
  districtValue = "";
  sectorValue = "";
  cellValue = "";
  villageValue = "";
  validForm = true;
  save = false;
  paymentChannels: any;
  channels: any;
  treeVarieties: any;
  ranges = ["0-3", "4-10", "11-15", "16-20", "21-24", "25-30", "31+"];
  certificates: any;
  upi: any;
  land: any;
  province: any;
  district: any;
  sector: any;
  cell: any;
  village: any;

  public requestList: FormArray;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private farmerService: FarmerService,
    private userService: UserService,
    private organisationService: OrganisationService,
    private locationService: LocationService,
    private siteService: SiteService,
    private confirmDialogService: ConfirmDialogService,
    private authenticationService: AuthenticationService,
    private authorisationService: AuthorisationService,
    private messageService: MessageService,
    private helperService: HelperService,
    private location: Location,
    private farmService: FarmService
  ) {
    super();
  }

  ngOnInit() {
    
    this.createForm = this.formBuilder.group({
      foreName: [""],
      surname: [""],
      groupName: [""],
      phone_number: [""],
      sex: ["m"],
      NID: [""],
      type: ["", Validators.required],
      groupContactPerson: this.formBuilder.group({
        firstName: [""],
        lastName: [""],
        phone: [""],
      }),
      /* paymentChannels: new FormArray([]), */
      requests: new FormArray([]),
      location: this.formBuilder.group({
        prov_id: [""],
        dist_id: [""],
        sect_id: [""],
        cell_id: [""],
        village_id: [""],
      }),
      familySize: [""],
      fertilizer_allocate: [0],
      tree_location: this.formBuilder.group({
        prov_id: [
          { value: this.provinceValue, disabled: this.disableProvId },
          Validators.required,
        ],
        dist_id: [
          { value: "", disabled: this.disableDistId },
          Validators.required,
        ],
        sect_id: ["", Validators.required],
        cell_id: ["", Validators.required],
        village_id: ["", Validators.required],
      }),
      upiNumber: [""],
      landOwner: [""],
      longitudeCoordinate: [""],
      latitudeCoordinate: [""],
      active: [""],
      treeAges: new FormArray([]),
      certificates: new FormArray([]),
      numberOfTrees: ["", [Validators.required, Validators.pattern("[0-9]*")]],
    });

    this.farmService.listTreeVarieties().subscribe((data) => {
      this.treeVarieties = data.data;
      this.createAgeRanges();
    });
    this.currentSeason = this.authenticationService.getCurrentSeason();
    this.isUserCWSOfficer = this.authorisationService.isCWSUser();
    this.isUserDistrictCashCrop =
      this.authorisationService.isDistrictCashCropOfficer();
    this.isUserSiteManager = this.authorisationService.isSiteManager();
    this.user = this.authenticationService.getCurrentUser();
    if (
      this.isUserSiteManager ||
      this.isUserDistrictCashCrop ||
      this.isUserCWSOfficer
    ) {
      this.disableDistId = true;
      this.disableProvId = true;
    }
    this.route.params.subscribe((params) => {
      if (params.id !== undefined) {
        this.createFromPending = true;
        this.id = params.id;
      }
    });
    this.locationService.getProvinces().subscribe((data) => {
      this.addressProvinces = data;
    });

    if (this.authenticationService.getCurrentUser().orgInfo.distributionSite) {
      this.siteService
        .get(
          this.authenticationService.getCurrentUser().orgInfo.distributionSite
        )
        .subscribe((site) => {
          this.site = site.content;
        });
    }
    this.organisationService
      .get(this.authenticationService.getCurrentUser().info.org_id)
      .subscribe((data) => {
        this.org = data.content;
      });
    if (this.createFromPending) {
      this.farmerService.getPendingFarmer(this.id).subscribe(
        (data) => {
          this.farmer = data.content;
          this.createFromPending = true;
          const temp = {
            foreName: this.farmer.foreName,
            surname: this.farmer.surname,
            groupName: this.farmer.surname,
            phone_number: this.farmer.phone_number,
            NID: this.farmer.NID,
            requests: [
              {
                numberOfTrees: this.farmer.numberOfTrees,
                fertilizer_need: this.farmer.fertilizer_need,
                fertilizer_allocate: this.farmer.fertilizer_allocate,
              },
            ],
          };

          if (this.farmer.NID !== "") {
            this.verifyNID(this.farmer.NID);
          }
          if (!isUndefined(this.farmer.location)) {
            this.provinceValue = this.farmer.location.prov_id;
            this.districtValue = this.farmer.location.dist_id;
            this.sectorValue = this.farmer.location.sect_id;
            this.cellValue = this.farmer.location.cell_id;
            this.villageValue = this.farmer.location.village_id;
          }
          (this.createForm.controls.requests as FormArray).push(
            this.createRequest()
          );
          this.createForm.patchValue(temp);
          this.onChangeProvince(0);
        },
        () => {
          this.createFromPending = true;
          this.setError(["something went wrong!"]);
        }
      );
    } else {
      if (this.isUserCWSOfficer) {
        this.organisationService
          .get(this.authenticationService.getCurrentUser().info.org_id)
          .subscribe((data) => {
            this.provinceValue = data.content.location.prov_id._id;
            this.districtValue = data.content.location.dist_id._id;
            this.locationService
              .getDistricts(data.content.location.prov_id._id)
              .subscribe((districts) => {
                this.districts.push(districts);
              });
            const temp = [];
            data.content.coveredSectors.map((sector) => {
              temp.push({
                _id: sector.sectorId._id,
                name: sector.sectorId.name,
              });
            });
            this.sectors.push(temp);
            (this.createForm.controls.requests as FormArray).push(
              this.createRequest()
            );
          });
      } else if (this.isUserDistrictCashCrop) {
        this.provinceValue =
          this.authenticationService.getCurrentUser().info.location.prov_id;
        this.districtValue =
          this.authenticationService.getCurrentUser().info.location.dist_id;
        this.locationService
          .getDistricts(
            this.authenticationService.getCurrentUser().info.location.prov_id
          )
          .subscribe((districts) => {
            this.districts.push(districts);
          });
        this.locationService
          .getSectors(
            this.authenticationService.getCurrentUser().info.location.dist_id
          )
          .subscribe((sectors) => {
            this.sectors.push(sectors);
          });
        (this.createForm.controls.requests as FormArray).push(
          this.createRequest()
        );
      } else if (this.isUserSiteManager && !this.isUserCWSOfficer) {
        this.siteService
          .get(
            this.authenticationService.getCurrentUser().orgInfo.distributionSite
          )
          .subscribe((site) => {
            this.site = site.content;
            this.provinceValue = this.site.location.prov_id._id;
            this.districtValue = this.site.location.dist_id._id;
            this.locationService
              .getDistricts(this.site.location.prov_id._id)
              .subscribe((districts) => {
                this.districts.push(districts);
                (this.createForm.controls.requests as FormArray).push(
                  this.createRequest()
                );
              });
            const temp = [];
            this.site.coveredAreas.coveredSectors.map((sector) => {
              temp.push({
                _id: sector.sect_id,
                name: sector.name,
              });
            });
            this.sectors.push(temp);
          });
      } else {
        (this.createForm.controls.requests as FormArray).push(
          this.createRequest()
        );
      }
    }

    this.initial();
    this.getPaymentChannels();
    /* this.addPaymentChannel(); */
    this.setMessage(this.messageService.getMessage());
    this.onChangeType();
    this.onChanges();
  }

  validateUPI(upi: string) {
    if (upi.length >= 15) {
      const body = {
        upiNumber: upi,
      };
      this.farmService.validateUPI(body).subscribe(
        (data) => {
          this.upi = data.data;
          this.locationService
            .getProvinceByName(
              this.upi.parcelLocation.province.provinceName.toUpperCase()
            )
            .subscribe(
              (pr) => {
                this.province = pr[0];
              },
              (err) => {},
              () => {
                this.createForm.controls.tree_location
                  .get("prov_id")
                  .setValue(this.province._id, { emitEvent: true });
                this.locationService
                  .getDistrictByName(
                    this.titleCase(
                      this.upi.parcelLocation.district.districtName
                    )
                  )
                  .subscribe(
                    (dst) => {
                      this.district = dst[0];
                    },
                    (err) => {},
                    () => {
                      this.createForm.controls.tree_location
                        .get("dist_id")
                        .setValue(this.district._id, { emitEvent: true });
                      this.locationService
                        .getSectorByName(
                          this.titleCase(
                            this.upi.parcelLocation.sector.sectorName
                          ),
                          this.district.id
                        )
                        .subscribe(
                          (sect) => {
                            this.sector = sect[0];
                          },
                          (err) => {},
                          () => {
                            this.createForm.controls.tree_location
                              .get("sect_id")
                              .setValue(this.sector._id, { emitEvent: true });
                            this.locationService
                              .getCellByName(
                                this.titleCase(
                                  this.upi.parcelLocation.cell.cellName
                                ),
                                this.sector.id
                              )
                              .subscribe(
                                (cel) => {
                                  this.cell = cel[0];
                                },
                                (err) => {},
                                () => {
                                  this.createForm.controls.tree_location
                                    .get("cell_id")
                                    .setValue(this.cell._id, {
                                      emitEvent: true,
                                    });
                                  this.locationService
                                    .getVillageByName(
                                      this.titleCase(
                                        this.upi.parcelLocation.village
                                          .villageName
                                      ),
                                      this.cell.id
                                    )
                                    .subscribe(
                                      (vil) => {
                                        this.village = vil[0];
                                      },
                                      (err) => {},
                                      () => {
                                        this.createForm.controls.tree_location
                                          .get("village_id")
                                          .setValue(this.village._id);
                                      }
                                    );
                                }
                              );
                          }
                        );
                    }
                  );
              }
            );
          this.createForm.controls.landOwner.setValue(
            this.upi.representative.surname +
              " " +
              this.upi.representative.foreNames
          );
          if (!Object.keys(this.upi).length) {
            this.setError(["UPI not found"]);
          }
        },
        (error) => {
          this.createForm.controls.landOwner.reset();
          this.setError(["UPI not found"]);
        }
      );
    }
  }

  titleCase(word: string) {
    return word[0].toUpperCase() + word.substr(1).toLowerCase();
  }

  getTreeLocationInput(field: string) {
    return this.createForm.controls.tree_location.get(field);
  }

  get formTreeAges() {
    return this.createForm.get("treeAges") as FormArray;
  }

  formTreeVarieties(i: number) {
    return this.formTreeAges.at(i).get("varieties") as FormArray;
  }

  addTreeVariety(i: number) {
    this.formTreeVarieties(i).push(
      this.formBuilder.group({
        selected: [false],
        number: [0],
      })
    );
  }

  createAgeRanges() {
    this.ranges.forEach((range, i) => {
      this.formTreeAges.push(
        this.formBuilder.group({
          range,
          numOfTrees: [0],
          varieties: new FormArray([]),
        })
      );
      this.treeVarieties.forEach((variety, t) => {
        this.formTreeVarieties(i).push(
          this.formBuilder.group({
            selected: [false],
            number: [0],
          })
        );
      });
    });
  }

  get formCertificates() {
    return this.createForm.get("certificates") as FormArray;
  }

  createCertificate(): FormGroup {
    return this.formBuilder.group({
      name: [""],
      identificationNumber: [""],
    });
  }

  addCertificate() {
    (this.createForm.controls.certificates as FormArray).push(
      this.createCertificate()
    );
  }

  removeCertificate(index: number) {
    (this.createForm.controls.certificates as FormArray).removeAt(index);
  }

  getCertificateFormGroup(index): FormGroup {
    this.certificates = this.createForm.get("certificates") as FormArray;
    return this.certificates.controls[index] as FormGroup;
  }

  updateList(i: number, v: number) {
    const value = this.createForm.controls.treeAges.value;
    const sum = value[i].varieties
      .map((item) => item.number)
      .reduce((prev, curr) => prev + curr, 0);
    this.formTreeAges
      .at(i)
      .get("numOfTrees")
      .setValue(sum, { emitEvent: true });
    if (this.formTreeVarieties(i).at(v).get("number").value !== 0) {
      this.formTreeVarieties(i).at(v).get("selected").setValue(true);
    } else {
      this.formTreeVarieties(i).at(v).get("selected").setValue(false);
    }
  }

  onSubmit() {
    if (this.createForm.valid) {
      if (this.createFromPending) {
        const temp = this.createForm.getRawValue();
        const farmer = {};
        farmer["fertilizer_need".toString()] = temp.requests[0].fertilizer_need;
        farmer["fertilizer_allocate".toString()] =
          temp.requests[0].fertilizer_allocate;
        farmer["location".toString()] = temp.requests[0].location;
        farmer["numberOfTrees".toString()] = temp.requests[0].numberOfTrees;
        farmer["_id".toString()] = this.id;
        farmer["created_by".toString()] =
          this.authenticationService.getCurrentUser().info._id;
        farmer["type".toString()] = temp.type;
        farmer["phone_number".toString()] = temp.phone_number;
        if (!this.isGroup) {
          farmer["surname".toString()] = temp.surname;
          farmer["foreName".toString()] = temp.foreName;
          farmer["sex".toString()] = temp.sex;
          farmer["NID".toString()] = temp.NID;
          farmer["location".toString()] = temp.location;
          farmer["familySize".toString()] = temp.familySize;
        } else {
          farmer["groupName".toString()] = temp.groupName;
          farmer["groupContactPerson".toString()] = temp.groupContactPerson;
        }
        this.helperService.cleanObject(farmer);
        if (this.isGroup) {
          this.farmerService
            .checkFarmerGroupName(temp.groupName)
            .subscribe((data) => {
              if (data.exists) {
                const message =
                  "Farmer with this group name (" +
                  temp.groupName +
                  ") already exists would you like to add land to the farmer?";
                this.confirmTempoAndSave(farmer, message);
              } else {
                this.farmerService.createFromPending(farmer).subscribe(
                  () => {
                    this.messageService.setMessage(
                      "Record successful moved to approved list!"
                    );
                    this.router.navigateByUrl("admin/farmers/list");
                  },
                  (err) => {
                    this.setError(err.errors);
                  }
                );
              }
            });
        } else {
          this.farmerService.checkFarmerNID(temp.NID).subscribe((data) => {
            if (data.exists) {
              const message =
                "Farmer with this NID (" +
                temp.NID +
                ") already exists would you like to add land to the farmer?";
              this.confirmTempoAndSave(farmer, message);
            } else {
              this.farmerService.createFromPending(farmer).subscribe(
                () => {
                  this.messageService.setMessage(
                    "Record successful moved to approved list!"
                  );
                  this.router.navigateByUrl("admin/farmers/list");
                },
                (err) => {
                  this.setError(err.errors);
                }
              );
            }
          });
        }
      } else {
        const temp = this.createForm.getRawValue();
        const farmer = {
          requestInfo: [],
        };
        farmer["_id".toString()] = this.id;
        farmer["type".toString()] = temp.type;
        farmer["phone_number".toString()] = temp.phone_number;
        farmer["created_by".toString()] =
          this.authenticationService.getCurrentUser().info._id;
        if (!this.isGroup) {
          farmer["surname".toString()] = temp.surname;
          farmer["foreName".toString()] = temp.foreName;
          farmer["sex".toString()] = temp.sex;
          farmer["NID".toString()] = temp.NID;
          farmer["location".toString()] = temp.location;
          farmer["familySize".toString()] = temp.familySize;
        } else {
          farmer["groupName".toString()] = temp.groupName;
          farmer["groupContactPerson".toString()] = temp.groupContactPerson;
        }
        farmer["requestInfo".toString()] = temp.requests;
        this.helperService.cleanObject(farmer);
        farmer.requestInfo.map((item) => {
          item["fertilizer_need".toString()] =
            +item["numberOfTrees".toString()] *
            this.currentSeason.seasonParams.fertilizerKgPerTree;
          return this.helperService.cleanObject(item);
        });
        if (this.isGroup) {
          this.farmerService
            .checkFarmerGroupName(temp.groupName)
            .subscribe((data) => {
              if (data.exists) {
                const message =
                  "Farmer with this group name (" +
                  temp.groupName +
                  ") already exists would you like to add land(s) to the farmer?";
                this.confirmFarmerAndSave(farmer, message);
              } else {
                this.farmerService.save(farmer).subscribe(
                  () => {
                    this.messageService.setMessage(
                      "Farmer successfully created!"
                    );
                    this.router.navigateByUrl("admin/farmers/list");
                  },
                  (err) => {
                    this.setError(err.errors);
                  }
                );
              }
            });
        } else {
          this.farmerService.checkFarmerNID(temp.NID).subscribe((data) => {
            if (data.exists) {
              const message =
                "Farmer with this NID (" +
                temp.NID +
                ") already exists would you like to add land(s) to the farmer?";
              this.confirmFarmerAndSave(farmer, message);
            } else {
              this.farmerService.save(farmer).subscribe(
                () => {
                  this.messageService.setMessage(
                    "Farmer successfully created!"
                  );
                  this.location.back();
                },
                (err) => {
                  if (isArray(err.errors)) {
                    this.setError(err.errors);
                  } else {
                    this.setError([err.errors]);
                  }
                }
              );
            }
          });
        }
      }
    } else {
      if (
        this.helperService.getFormValidationErrors(this.createForm).length > 0
      ) {
        this.setError(
          this.helperService.getFormValidationErrors(this.createForm)
        );
      }
      if (this.createForm.get("requests").invalid) {
        this.setError("Missing required land(s) information");
      }
    }
  }

  confirmTempoAndSave(farmer: any, message: string) {
    this.confirmDialogService
      .openConfirmDialog(message)
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.farmerService.createFromPending(farmer).subscribe(
            () => {
              this.messageService.setMessage(
                "Record successful moved to approved list!"
              );
              this.router.navigateByUrl("admin/farmers/list");
            },
            (err) => {
              if (isArray(err.errors)) {
                this.setError(err.errors);
              } else {
                this.setError([err.errors]);
              }
              return;
            }
          );
        }
      });
  }

  confirmFarmerAndSave(farmer: any, message: string) {
    this.confirmDialogService
      .openConfirmDialog(message)
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.farmerService.save(farmer).subscribe(
            () => {
              this.messageService.setMessage("Farmer successfully created!");
              this.router.navigateByUrl("admin/farmers/list");
            },
            (err) => {
              this.setError(err.errors);
            }
          );
        }
      });
  }

  getLocationInput(i: number, field: string) {
    return this.getRequestsFormGroup(i).controls.location.get(field);
  }

  onInputNID(nid: string) {
    this.verifyNID(nid);
  }

  verifyNID(nid: string) {
    if (nid.length >= 16) {
      this.clear();
      this.loading = true;
      this.userService.verifyNID(nid).subscribe(
        (data) => {
          const info = {
            foreName: data.content.foreName,
            surname: data.content.surname,
            sex: data.content.sex.toLowerCase(),
          };
          this.createForm.patchValue(info);
          this.submit = true;
          this.clear();
          this.loading = false;
          this.invalidId = false;
        },
        () => {
          this.submit = false;
          this.loading = false;
          if (!this.isGroup) {
            this.invalidId = true;
          }
        }
      );
    } else {
      this.submit = false;
      this.resetNIDInfo();
    }
  }

  resetNIDInfo() {
    this.createForm.get("foreName".toString()).reset();
    this.createForm.get("surname".toString()).reset();
    this.createForm.get("sex".toString()).reset();
  }

  createRequest(): FormGroup {
    return this.formBuilder.group({
      numberOfTrees: [
        "",
        [Validators.required, Validators.min(1), Validators.pattern("[0-9]*")],
      ],
      fertilizer_need: [""],
      fertilizer_allocate: [0],
      location: this.formBuilder.group({
        prov_id: [
          { value: this.provinceValue, disabled: this.disableProvId },
          Validators.required,
        ],
        dist_id: [
          { value: this.districtValue, disabled: this.disableDistId },
          Validators.required,
        ],
        sect_id: [this.sectorValue, Validators.required],
        cell_id: [this.cellValue, Validators.required],
        village_id: [this.villageValue, Validators.required],
      }),
      tree_location: this.formBuilder.group({
        prov_id: [
          { value: this.provinceValue, disabled: this.disableProvId },
          Validators.required,
        ],
        dist_id: [
          { value: this.districtValue, disabled: this.disableDistId },
          Validators.required,
        ],
        sect_id: [this.sectorValue, Validators.required],
        cell_id: [this.cellValue, Validators.required],
        village_id: [this.villageValue, Validators.required],
      }),
    });
  }

  get formRequests() {
    return this.createForm.get("requests") as FormArray;
  }

  onCancel() {
    this.location.back();
  }

  addRequest() {
    (this.createForm.controls.requests as FormArray).push(this.createRequest());
    this.provinces.push(this.provinces[0]);
    if (this.disableDistId) {
      this.districts.push(this.districts[0]);
      this.onChangeDistrict(this.districts.length - 1);
    }
  }

  removeRequest(index: number) {
    (this.createForm.controls.requests as FormArray).removeAt(index);
  }

  getRequestsFormGroup(index): FormGroup {
    this.requestList = this.createForm.get("requests") as FormArray;
    return this.requestList.controls[index] as FormGroup;
  }

  onChangeType() {
    this.createForm.get("type".toString()).valueChanges.subscribe((value) => {
      if (+value === 2) {
        this.isGroup = true;
        this.submit = true;
        this.loading = false;
      } else {
        this.isGroup = false;
      }
    });
  }

  onChangeProvince(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get(
      "prov_id".toString()
    ).value;
    if (value !== "") {
      this.locationService
        .getDistricts(value)
        .toPromise()
        .then((data) => {
          this.districts[index] = data;
          this.sectors[index] = [];
          this.cells[index] = [];
          this.villages[index] = [];
          if (this.createFromPending) {
            this.getLocationInput(index, "dist_id").setValue(
              this.farmer.location.dist_id
            );
            this.onChangeDistrict(0);
          }
        });
    }
  }

  onChangeTreeProvince(index: number) {
    const value = this.getRequestsFormGroup(index).controls.tree_location.get(
      "prov_id".toString()
    ).value;
    if (value !== "") {
      this.locationService
        .getDistricts(value)
        .toPromise()
        .then((data) => {
          this.districts[index] = data;
          this.sectors[index] = [];
          this.cells[index] = [];
          this.villages[index] = [];
          if (this.createFromPending) {
            this.getTreeLocationInput("dist_id").setValue(
              this.farmer.location.dist_id
            );
            this.onChangeDistrict(0);
          }
        });
    }
  }

  onChangeDistrict(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get(
      "dist_id".toString()
    ).value;
    if (value !== "") {
      if (this.isUserSiteManager && !this.isUserCWSOfficer) {
        const temp = [];
        this.site.coveredAreas.coveredSectors.map((sector) => {
          temp.push({
            _id: sector.sect_id,
            name: sector.name,
          });
        });
        this.sectors.push(temp);
      } else if (this.isUserCWSOfficer) {
        this.filterCustomSectors(this.org, index);
      } else {
        this.locationService
          .getSectors(value)
          .toPromise()
          .then((data) => {
            this.sectors[index] = data;
            this.cells[index] = [];
            this.villages[index] = [];
          });
      }
      if (this.createFromPending) {
        this.getLocationInput(index, "sect_id").setValue(
          this.farmer.location.sect_id
        );
        this.onChangeSector(0);
      }
    }
  }

  onChangeSector(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get(
      "sect_id".toString()
    ).value;
    if (value !== "") {
      if (this.isUserCWSOfficer) {
        this.filterCustomCells(this.org, index);
      } else {
        this.locationService
          .getCells(value)
          .toPromise()
          .then((data) => {
            this.cells[index] = data;
            this.villages[index] = [];
            if (this.createFromPending) {
              this.getLocationInput(index, "cell_id").setValue(
                this.farmer.location.cell_id
              );
              this.onChangeCell(0);
            }
          });
      }
    }
  }

  onChangeCell(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get(
      "cell_id".toString()
    ).value;
    if (value !== "") {
      if (this.isUserCWSOfficer) {
        this.locationService
          .getVillages(value)
          .toPromise()
          .then((data) => {
            const sectorId = this.getRequestsFormGroup(
              index
            ).controls.location.get("sect_id".toString()).value;
            const i = this.org.coveredSectors.findIndex(
              (element) => element.sectorId._id === sectorId
            );
            const sector = this.org.coveredSectors[i];
            this.villages[index] = [];
            data.map((village) => {
              if (
                sector.coveredVillages.findIndex(
                  (vil) => village._id === vil.village_id
                ) >= 0
              ) {
                this.villages[index].push(village);
              }
            });
            if (this.createFromPending) {
              this.getLocationInput(index, "village_id").setValue(
                this.farmer.location.village_id
              );
            }
          });
      } else {
        this.locationService
          .getVillages(value)
          .toPromise()
          .then((data) => {
            this.villages[index] = data;
            if (this.createFromPending) {
              this.getLocationInput(index, "village_id").setValue(
                this.farmer.location.village_id
              );
            }
          });
      }
    }
  }

  validateNumbers(value: any) {
    const numberOfTrees = this.createForm.controls.numberOfTrees.value;
    const sumAllNumOfTrees = value
      .map((item) => item.numOfTrees)
      .reduce((prev, curr) => prev + curr, 0);
    const found = value.findIndex((range) => {
      const sumAllNumber = range.varieties
        .map((item) => item.number)
        .reduce((prev, curr) => prev + curr, 0);
      return range.numOfTrees !== sumAllNumber;
    });
    return !(found !== -1 || numberOfTrees !== sumAllNumOfTrees);
  }

  onChanges() {
    this.createForm.controls.location
      .get("prov_id".toString())
      .valueChanges.subscribe((value) => {
        
        if (value !== "") { 
          this.locationService.getDistricts(value).subscribe((data) => {
            this.addressDistricts = data;
            this.addressSectors = null;
            this.addressCells = null;
            this.addressVillages = null;
          });
        }
      });
    this.createForm.controls.location
      .get("dist_id".toString())
      .valueChanges.subscribe((value) => {
        if (value !== "") {
          this.locationService.getSectors(value).subscribe((data) => {
            this.addressSectors = data;
            this.addressCells = null;
            this.addressVillages = null;
          });
        }
      });

    this.createForm.controls.location
      .get("sect_id".toString())
      .valueChanges.subscribe((value) => {
        if (value !== "") {
          this.locationService.getCells(value).subscribe((data) => {
            this.addressCells = data;
            this.addressVillages = null;
          });
        }
      });
    this.createForm.controls.location
      .get("cell_id".toString())
      .valueChanges.subscribe((value) => {
        if (value !== "") {
          this.locationService.getVillages(value).subscribe((data) => {
            this.addressVillages = data;
          });
        }
      });
    this.createForm.controls.treeAges.valueChanges.subscribe((value) => {
      if (value !== null) {
        this.validForm = this.validateNumbers(value);
        this.save = this.validForm;
      }
    });
    this.createForm.controls.numberOfTrees.valueChanges.subscribe((value) => {
      if (value !== null) {
        this.validForm = this.validateNumbers(
          this.createForm.controls.treeAges.value
        );
        this.save = this.validForm;
      }
    });
    this.createForm.controls.tree_location
      .get("prov_id".toString())
      .valueChanges.subscribe((value) => {
        if (value !== null) {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
            this.sectors = null;
            this.cells = null;
            this.villages = null;
          });
          if (this.isUserSiteManager && !this.isUserCWSOfficer) {
            const temp = [];
            this.site.coveredAreas.coveredSectors.map((sector) => {
              temp.push({
                _id: sector.sect_id,
                name: sector.name,
              });
            });
            this.sectors.push(temp);
          } else if (this.isUserCWSOfficer) {
            this.filterCustomSectors(this.org, 0);
          } else {
            this.locationService
              .getSectors(value)
              .toPromise()
              .then((data) => {
                this.sectors = data;
                this.cells = [];
                this.villages = [];
              });
          }
        }
      });
    this.createForm.controls.tree_location
      .get("dist_id".toString())
      .valueChanges.subscribe((value) => {
        if (value !== null) {
          this.locationService.getSectors(value).subscribe((data) => {
            this.sectors = data;
            this.cells = null;
            this.villages = null;
          });
          if (this.isUserCWSOfficer) {
            this.filterCustomCells(this.org, 0);
          } else {
            this.locationService
              .getCells(value)
              .toPromise()
              .then((data) => {
                this.cells = data;
                this.villages = [];
              });
          }
        }
      });
    this.createForm.controls.tree_location
      .get("sect_id".toString())
      .valueChanges.subscribe((value) => {
        if (value !== null) {
          this.locationService.getCells(value).subscribe((data) => {
            this.cells = data;
            this.villages = null;
          });
          if (this.isUserCWSOfficer) {
            this.filterCustomCells(this.org, 0);
          } else {
            this.locationService
              .getVillages(value)
              .toPromise()
              .then((data) => {
                this.villages = data;
              });
          }
        }
      });
    this.createForm.controls.tree_location
      .get("cell_id".toString())
      .valueChanges.subscribe((value) => {
        if (value !== null) {
          this.locationService.getVillages(value).subscribe((data) => {
            if (this.isUserCWSOfficer) {
              this.filterCustomVillages(this.org, data);
            } else {
              this.villages = data;
            }
          });
        }
      });
  }

  filterCustomVillages(org: any, villages: any) {
    const temp = [];
    const sectorId = this.createForm.controls.tree_location.get(
      "sect_id".toString()
    ).value;
    const i = org.coveredSectors.findIndex(
      (element) => element.sectorId._id === sectorId
    );
    const sector = org.coveredSectors[i];
    sector.coveredVillages.map((village) => {
      if (villages.findIndex((el) => el._id === village.village_id)) {
        temp.push({
          _id: village.village_id,
          name: village.name,
        });
      }
    });
    this.villages = temp;
  }

  get formPaymentChannel() {
    return this.createForm.controls.paymentChannels as FormArray;
  }

  onChangePaymentChannel(index: number) {
    const value = this.formPaymentChannel.value[index];
    this.formPaymentChannel.value.forEach((el, i) => {
      if (
        value.inputName === el.inputName &&
        this.formPaymentChannel.value.length > 1 &&
        i !== index
      ) {
        this.removePaymentChannel(index);
      }
    });
  }

  addPaymentChannel() {
    (this.createForm.controls.paymentChannels as FormArray).push(
      this.createPaymentChannel()
    );
  }

  removePaymentChannel(index: number) {
    (this.createForm.controls.paymentChannels as FormArray).removeAt(index);
  }

  getPaymenntChannelFormGroup(index): FormGroup {
    this.paymentChannels = this.createForm.controls
      .paymentChannels as FormArray;
    return this.paymentChannels.controls[index] as FormGroup;
  }

  createPaymentChannel(): FormGroup {
    return this.formBuilder.group({
      channelId: ["", Validators.required],
      account: ["", Validators.required],
    });
  }

  filterCustomSectors(org: any, index: number) {
    const temp = [];
    org.coveredSectors.map((sector) => {
      temp.push({
        _id: sector.sectorId._id,
        name: sector.sectorId.name,
      });
    });
    this.sectors[index] = temp;
  }

  filterCustomCells(org: any, index: number) {
    const temp = [];
    const sectorId = this.getRequestsFormGroup(index).controls.location.get(
      "sect_id".toString()
    ).value;
    const i = org.coveredSectors.findIndex(
      (element) => element.sectorId._id === sectorId
    );
    const sector = org.coveredSectors[i];
    sector.coveredCells.map((cell) => {
      temp.push({
        _id: cell.cell_id,
        name: cell.name,
      });
    });
    this.cells[index] = temp;
  }

  initial() {
    this.locationService
      .getProvinces()
      .toPromise()
      .then((data) => {
        this.provinces = data;
      });
  }

  getPaymentChannels() {
    this.channels = [
      {
        name: "MTN",
        _id: "5d1635ac60c3dd116164d4ae",
      },
      {
        name: "IKOFI",
        _id: "5d1635ac60c3dd116164d4ac",
      },
    ];
  }

  ngOnDestroy() {}
}
