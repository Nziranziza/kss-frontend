import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID,} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HelperService} from '../../../../core';
import {
  AuthenticationService,
  AuthorisationService,
  FarmerService,
  FarmService,
  LocationService,
  MessageService,
  OrganisationService,
  SiteService,
} from '../../../../core';
import {isPlatformBrowser} from '@angular/common';
import {Router} from '@angular/router';
import {BasicComponent} from '../../../../core';

@Component({
  selector: 'app-add-farmer-request',
  templateUrl: './add-farmer-request.component.html',
  styleUrls: ['./add-farmer-request.component.css'],
})
export class AddFarmerRequestComponent
  extends BasicComponent
  implements OnInit {
  modal: NgbActiveModal;
  @Input() farmerId;
  createForm: FormGroup;
  provinces = [];
  districts = [];
  sectors = [];
  cells = [];
  villages = [];
  loading = false;
  requestIndex = 0;
  currentSeason: any;
  org: any;
  isUserSiteManager = false;
  isUserDistrictCashCrop = false;
  isUserCWSOfficer = false;
  user: any;
  site: any;
  disableProvId = false;
  disableDistId = false;
  provinceValue = '';
  districtValue = '';
  treeVarieties: any;
  ranges = ['0-3', '4-10', '11-15', '16-20', '21-25', '26-30', '31+'];
  certificates: any;
  certificateNames = [{
    name: 'Organic',
  }, {
    name: 'Fair Trade',
  }, {
    name: 'Rain Forest',
  }, {
    name: 'UTZ',
  }, {
    name: 'C.A.F.E Practice',
  }, {
    name: '4C',
  }, {
    name: 'Appellation',
  }];
  validForm = true;
  save = false;
  upi: any;
  land: any;
  province: any;
  district: any;
  sector: any;
  cell: any;
  village: any;
  checkIfUpiinValidZoning = {
    prov_id: true,
    dist_id: true,
    sect_id: true,
    cell_id: true,
    village_id: true
  };
  showUPILocations = false;

  public requestList: FormArray;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
    private injector: Injector,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private siteService: SiteService,
    private organisationService: OrganisationService,
    private helper: HelperService,
    private farmerService: FarmerService,
    private messageService: MessageService,
    private authorisationService: AuthorisationService,
    private locationService: LocationService,
    private farmService: FarmService
  ) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  get formTreeAges() {
    return this.createForm.get('treeAges') as FormArray;
  }

  get formCertificates() {
    return this.createForm.get('certificates') as FormArray;
  }

  get formRequests() {
    return this.createForm.get('requests') as FormArray;
  }

  ngOnInit() {
    // NG Form Build Form
    this.createForm = this.formBuilder.group({
      familySize: [''],
      fertilizer_allocate: [0],
      location: this.formBuilder.group({
        prov_id: [
          {value: '', disabled: this.disableProvId},
          Validators.required,
        ],
        dist_id: [
          {value: '', disabled: this.disableDistId},
          Validators.required,
        ],
        sect_id: ['', Validators.required],
        cell_id: ['', Validators.required],
        village_id: ['', Validators.required],
      }),
      location_if_upi: this.formBuilder.group({
        prov_id: [{value: '', disabled: true}],
        dist_id: [{value: '', disabled: true}],
        sect_id: [{value: '', disabled: true}],
        cell_id: [{value: '', disabled: true}],
        village_id: [{value: '', disabled: true}],
      }),
      upiNumber: [''],
      landOwner: [''],
      longitudeCoordinate: [''],
      latitudeCoordinate: [''],
      active: [''],
      treeAges: new FormArray([]),
      certificates: new FormArray([]),
      numberOfTrees: ['', [Validators.required, Validators.pattern('[0-9]*')]],
    });
    this.farmService.listTreeVarieties().subscribe((data) => {
      this.treeVarieties = data.data;
      this.createAgeRanges();
    });
    this.currentSeason = this.authenticationService.getCurrentSeason();
    this.isUserDistrictCashCrop = this.authorisationService.isDistrictCashCropOfficer();
    this.isUserSiteManager = this.authorisationService.isSiteManager();
    this.isUserCWSOfficer = this.authorisationService.isCWSUser();
    this.user = this.authenticationService.getCurrentUser();

    this.organisationService
      .get(this.authenticationService.getCurrentUser().info.org_id)
      .subscribe((data) => {
        this.org = data.content;
      });

    if (
      this.isUserSiteManager ||
      this.isUserDistrictCashCrop ||
      this.isUserCWSOfficer
    ) {
      this.disableDistId = true;
      this.disableProvId = true;
    }
    if (this.isUserCWSOfficer) {
      this.organisationService
        .get(this.authenticationService.getCurrentUser().info.org_id)
        .subscribe((data) => {
          this.provinceValue = data.content.location.prov_id._id;
          this.districtValue = data.content.location.dist_id._id;
          this.setDisabledLocation();
          this.locationService
            .getDistricts(data.content.location.prov_id._id)
            .subscribe((districts) => {
              this.districts = districts;
            });
          const temp = [];
          data.content.coveredSectors.map((sector) => {
            temp.push({
              _id: sector.sectorId._id,
              name: sector.sectorId.name,
            });
          });
          this.sectors = temp;
        });
    } else if (this.isUserDistrictCashCrop) {
      this.provinceValue =
        this.authenticationService.getCurrentUser().info.location.prov_id;
      this.districtValue =
        this.authenticationService.getCurrentUser().info.location.dist_id;
      this.setDisabledLocation();
      this.locationService
        .getDistricts(
          this.authenticationService.getCurrentUser().info.location.prov_id
        )
        .subscribe((districts) => {
          this.districts = districts;
        });
      this.locationService
        .getSectors(
          this.authenticationService.getCurrentUser().info.location.dist_id
        )
        .subscribe((sectors) => {
          this.sectors = sectors;
        });

    } else if (this.isUserSiteManager && !this.isUserCWSOfficer) {
      this.siteService
        .get(
          this.authenticationService.getCurrentUser().orgInfo.distributionSite
        )
        .subscribe((site) => {
          this.site = site.content;
          this.provinceValue = this.site.location.prov_id._id;
          this.districtValue = this.site.location.dist_id._id;
          this.setDisabledLocation();
          this.locationService
            .getDistricts(this.site.location.prov_id._id)
            .subscribe((districts) => {
              this.districts = districts ;
            });
          const temp = [];
          this.site.coveredAreas.coveredSectors.map((sector) => {
            temp.push({
              _id: sector.sect_id,
              name: sector.name,
            });
          });
          this.sectors = temp;
        });
    }
    this.initial();
    this.onChange();
  }

  getTreeLocationInput(field: string) {
    return this.createForm.controls.location.get(field);
  }

  formTreeVarieties(i: number) {
    return this.formTreeAges.at(i).get('varieties') as FormArray;
  }

  addTreeVariety(i: number) {
    this.formTreeVarieties(i).push(
      this.formBuilder.group({
        selected: [false],
        number: [0],
        varietyId: [''],
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
            varietyId: [variety._id],
          })
        );
      });
    });
  }

  createCertificate(): FormGroup {
    return this.formBuilder.group({
      name: [''],
      identificationNumber: [''],
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
    this.certificates = this.createForm.get('certificates') as FormArray;
    return this.certificates.controls[index] as FormGroup;
  }

  updateList(i: number, v: number) {
    const value = this.createForm.controls.treeAges.value;
    const sum = value[i].varieties
      .map((item) => item.number)
      .reduce((prev, curr) => prev + curr, 0);
    this.formTreeAges
      .at(i)
      .get('numOfTrees')
      .setValue(sum, {emitEvent: true});
    if (this.formTreeVarieties(i).at(v).get('number').value !== 0) {
      this.formTreeVarieties(i).at(v).get('selected').setValue(true);
    } else {
      this.formTreeVarieties(i).at(v).get('selected').setValue(false);
    }
  }

  validateUPI(event) {
    const upi = event.target.value
    this.showUPILocations = false;

    if (upi.length > 0) {
      this.createForm.controls.upiNumber.setErrors({invalid: true});
    }
    this.checkIfUpiinValidZoning = {
      prov_id: true,
      dist_id: true,
      sect_id: true,
      cell_id: true,
      village_id: true
    };

    if (upi.length >= 15) {
      const body = {
        upiNumber: upi,
      };
      this.farmService.validateUPI(body).subscribe(
        (data) => {
          this.upi = data.data;
          // Reset Validators
          this.createForm.controls.upiNumber.setErrors(null);

          const payload = {
            province: this.upi.parcelLocation.province.provinceName.toUpperCase(),
            district: this.titleCase(this.upi.parcelLocation.district.districtName),
            sector: this.titleCase(this.upi.parcelLocation.sector.sectorName),
            cell: this.titleCase(this.upi.parcelLocation.cell.cellName),
            village: this.titleCase(this.upi.parcelLocation.village.villageName),
          }

          this.locationService.getZoningIDS(payload).subscribe(
            (pr) => {
              this.province = pr;
            },
            () => {
            },
            () => {

              this.showUPILocations = true;

              const villagesSet = [];
              this.org.coveredSectors.map((sector) => {
                sector.coveredVillages.map((village) => {
                  villagesSet.push(village.village_id);
                });
              });

              if (this.province.province_id !== this.org.location.prov_id._id) {
                this.checkIfUpiinValidZoning.prov_id = false
                this.createForm.controls.upiNumber.setErrors({Invalid: true});
              } else if (this.province.district_id !== this.org.location.dist_id._id) {
                this.checkIfUpiinValidZoning.dist_id = false
                this.createForm.controls.upiNumber.setErrors({Invalid: true});
              } else if (!villagesSet.includes(this.province.village_id)) { // If yes, use location.
                this.checkIfUpiinValidZoning.village_id = false
                this.createForm.controls.upiNumber.setErrors({Invalid: true});
              } else {

                this.provinces = [{
                  _id: this.province.province_id,
                  namee: this.titleCase(this.upi.parcelLocation.province.provinceName)
                }];
                this.districts = [{
                  _id: this.province.district_id,
                  name: this.titleCase(this.upi.parcelLocation.district.districtName)
                }];
                this.sectors = [{
                  _id: this.province.sector_id,
                  name: this.titleCase(this.upi.parcelLocation.sector.sectorName)
                }];
                this.cells = [{
                  _id: this.province.cell_id,
                  name: this.titleCase(this.upi.parcelLocation.cell.cellName)
                }];
                this.villages = [{
                  _id: this.province.village_id,
                  name: this.titleCase(this.upi.parcelLocation.village.villageName)
                }];

                this.createForm.controls.location_if_upi.get('prov_id').setValue(this.province.province_id);
                this.createForm.controls.location_if_upi.get('dist_id').setValue(this.province.district_id);
                this.createForm.controls.location_if_upi.get('sect_id').setValue(this.province.sector_id);
                this.createForm.controls.location_if_upi.get('cell_id').setValue(this.province.cell_id);
                this.createForm.controls.location_if_upi.get('village_id').setValue(this.province.village_id);
              }
            }
          );

          this.createForm.controls.landOwner.setValue(
            this.upi.representative.surname +
            ' ' +
            this.upi.representative.foreNames
          );

          if (!Object.keys(this.upi).length) {
            this.setError(['UPI not found']);
          }
        },
        (error) => {
          this.createForm.controls.landOwner.reset();
          this.setError(['UPI not found']);
        }
      );
    }
  }

  titleCase(word: string) {
    return word[0].toUpperCase() + word.substr(1).toLowerCase();
  }

  onSubmit() {
    // First validate high level
    this.createForm.markAllAsTouched();

    if (this.createForm.controls.upiNumber.value) {
      this.createForm.controls.location.get('prov_id').clearValidators();
      this.createForm.controls.location.get('prov_id').updateValueAndValidity();
      this.createForm.controls.location.get('dist_id').clearValidators();
      this.createForm.controls.location.get('dist_id').updateValueAndValidity();
      this.createForm.controls.location.get('sect_id').clearValidators();
      this.createForm.controls.location.get('sect_id').updateValueAndValidity();
      this.createForm.controls.location.get('cell_id').clearValidators();
      this.createForm.controls.location.get('cell_id').updateValueAndValidity();
      this.createForm.controls.location.get('village_id').clearValidators();
      this.createForm.controls.location.get('village_id').updateValueAndValidity();
    }

    this.loading = true;

    if (this.createForm.valid) {
      const temp = this.createForm.getRawValue();
      const farmer = {
        requestInfo: [{}],
      };
      temp.treeAges.map((item) => {
        item.varieties.map((variety) => {
          delete variety.selected;
          return variety;
        });
      });
      farmer.requestInfo.map((item) => {
        item['fertilizer_need'.toString()] =
          +temp.numberOfTrees *
          this.currentSeason.seasonParams.fertilizerKgPerTree;
        item['landOwner'.toString()] = temp.landOwner;
        item['upiNumber'.toString()] = temp.upiNumber;
        item['treeAges'.toString()] = temp.treeAges;
        item['numberOfTrees'.toString()] = temp.numberOfTrees;
        if (this.createForm.controls.upiNumber.value)
          item['location'.toString()] = temp.location_if_upi;
        else item['location'.toString()] = temp.location;
        item['fertilizer_allocate'.toString()] = 0;
        item['certificates'.toString()] = temp.certificates;
        return this.helper.cleanObject(item);
      });
      farmer['created_by'.toString()] =
        this.authenticationService.getCurrentUser().info._id;
      this.helper.cleanObject(farmer);
      farmer['id'.toString()] = this.farmerId;
      this.farmerService.addFarmerRequest(farmer).subscribe(
        () => {
          this.loading = false;
          this.modal.close('request successfully added!');
          this.createForm.reset();
        },
        (err) => {
          this.loading = false;
          this.setError(err.errors);
        }
      );
    } else {
      if (this.helper.getFormValidationErrors(this.createForm).length > 0) {
        this.setError(this.helper.getFormValidationErrors(this.createForm));
      }
      if (this.createForm.get('requests').invalid) {
        this.setError('Missing required land(s) information');
      }
      this.loading = false;
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

  onChange() {
    this.createForm.controls.treeAges.valueChanges.subscribe((value) => {
      if (value !== null) {
        this.validForm = this.validateNumbers(value);
        this.save = this.validForm;
      }
    });
    this.createForm.controls.numberOfTrees.valueChanges.subscribe((value) => {
      if (value !== '') {
        this.validForm = this.validateNumbers(
          this.createForm.controls.treeAges.value
        );
        this.save = this.validForm;
      }
    });
    this.createForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
            this.sectors = null;
            this.cells = null;
            this.villages = null;
          });
        }
      }
    );
    this.createForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          if (this.isUserSiteManager && (!this.isUserCWSOfficer)) {
            const temp = [];
            this.site.coveredAreas.coveredSectors.map((sector) => {
              temp.push({
                _id: sector.sect_id,
                name: sector.name
              });
            });
            this.sectors = temp;
          } else if (this.isUserCWSOfficer) {
            this.filterCustomSectors(this.org);
          } else {
            this.locationService.getSectors(value).subscribe((data) => {
              this.sectors = data;
            });
          }
          this.cells = null;
          this.villages = null;
        }
      }
    );
    this.createForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          if (this.isUserCWSOfficer) {
            this.filterCustomCells(this.org);
          } else {
            this.locationService.getCells(value).subscribe((data) => {
              this.cells = data;
            });
          }
          this.villages = null;
        }
      }
    );
    this.createForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          this.locationService.getVillages(value).subscribe((data) => {
            if (this.isUserCWSOfficer) {
              this.filterCustomVillages(this.org, data);
            } else {
              this.villages = data;
            }
          });
        }
      }
    );
  }
  filterCustomSectors(org: any) {
    const temp = [];
    org.coveredSectors.map((sector) => {
      temp.push({
        _id: sector.sectorId._id,
        name: sector.sectorId.name
      });
    });
    this.sectors = temp;
  }

  filterCustomCells(org: any) {
    const temp = [];
    const sectorId = this.createForm.controls.location.get('sect_id'.toString()).value;
    const i = org.coveredSectors.findIndex(element => element.sectorId._id === sectorId);
    const sector = org.coveredSectors[i];
    sector.coveredCells.map((cell) => {
      temp.push({
        _id: cell.cell_id,
        name: cell.name
      });
    });
    this.cells = temp;
    console.log(this.cells);
  }

  filterCustomVillages(org: any, villages: any) {
    const temp = [];
    const sectorId = this.createForm.controls.location.get('sect_id'.toString()).value;
    const i = org.coveredSectors.findIndex(element => element.sectorId._id === sectorId);
    const sector = org.coveredSectors[i];
    sector.coveredVillages.map((village) => {
      if (villages.findIndex(el => el._id === village.village_id) !== -1) {
        temp.push({
          _id: village.village_id,
          name: village.name
        });
      }
    });
    this.villages = temp;
  }
  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
      this.setDisabledLocation();
    });
  }

  setDisabledLocation() {
    this.createForm.controls.location
      .get('prov_id'.toString())
      .patchValue(this.provinceValue, {emitEvent: false});

    this.createForm.controls.location
      .get('dist_id'.toString())
      .patchValue(this.districtValue, {emitEvent: false});
  }

}
