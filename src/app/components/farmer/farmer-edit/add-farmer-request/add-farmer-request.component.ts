import {
  Component,
  Inject,
  Injector,
  Input,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelperService } from '../../../../core/helpers';
import {
  AuthenticationService,
  AuthorisationService,
  FarmerService,
  FarmService,
  OrganisationService,
  SiteService,
} from '../../../../core/services';
import { isPlatformBrowser } from '@angular/common';
import { LocationService } from '../../../../core/services';
import { MessageService } from '../../../../core/services';
import { Router } from '@angular/router';
import { BasicComponent } from '../../../../core/library';

@Component({
  selector: 'app-add-farmer-request',
  templateUrl: './add-farmer-request.component.html',
  styleUrls: ['./add-farmer-request.component.css'],
})
export class AddFarmerRequestComponent
  extends BasicComponent
  implements OnInit
{
  modal: NgbActiveModal;
  @Input() farmerId;
  createForm: FormGroup;
  provinces = [];
  districts = [];
  sectors = [];
  cells = [];
  villages = [];
  addressProvinces: any;
  addressDistricts: any;
  addressSectors: any;
  addressCells: any;
  addressVillages: any;
  requestIndex = 0;
  currentSeason: any;
  org: any;
  isUserSiteManager = false;
  isUserDistrictCashCrop = false;
  isUserCWSOfficer = false;
  user: any;
  site: any;
  disableProvId = true;
  disableDistId = true;
  provinceValue = '';
  districtValue = '';
  treeVarieties: any;
  ranges = ['0-3', '4-10', '11-15', '16-20', '21-24', '25-30', '31+'];
  certificates: any;
  validForm = true;
  save = false;
  upi: any;
  land: any;
  province: any;
  district: any;
  sector: any;
  cell: any;
  village: any;

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

  ngOnInit() {

    this.createForm = this.formBuilder.group({
      familySize: [''],
      fertilizer_allocate: [0],
      location: this.formBuilder.group({
        prov_id: [
          { value: '', disabled: this.disableProvId },
          Validators.required,
        ],
        dist_id: [
          { value: '', disabled: this.disableDistId },
          Validators.required,
        ],
        sect_id: ['', Validators.required],
        cell_id: ['', Validators.required],
        village_id: ['', Validators.required],
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
    this.isUserDistrictCashCrop =
      this.authorisationService.isDistrictCashCropOfficer();
    this.isUserSiteManager = this.authorisationService.isSiteManager();
    this.isUserCWSOfficer = this.authorisationService.isCWSUser();
    this.user = this.authenticationService.getCurrentUser();
    this.initial();
    this.onChange();
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

  getTreeLocationInput(field: string) {
    return this.createForm.controls.location.get(field);
  }

  get formTreeAges() {
    return this.createForm.get('treeAges') as FormArray;
  }

  formTreeVarieties(i: number) {
    return this.formTreeAges.at(i).get('varieties') as FormArray;
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
    return this.createForm.get('certificates') as FormArray;
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
      .setValue(sum, { emitEvent: true });
    if (this.formTreeVarieties(i).at(v).get('number').value !== 0) {
      this.formTreeVarieties(i).at(v).get('selected').setValue(true);
    } else {
      this.formTreeVarieties(i).at(v).get('selected').setValue(false);
    }
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
                this.createForm.controls.location
                  .get('prov_id')
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
                      this.createForm.controls.location
                        .get('dist_id')
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
                            this.createForm.controls.location
                              .get('sect_id')
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
                                  this.createForm.controls.location
                                    .get('cell_id')
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
                                        this.createForm.controls.location
                                          .get('village_id')
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

  getLocationInput(i: number, field: string) {
    return this.getRequestsFormGroup(i).controls.location.get(field);
  }

  createRequest(): FormGroup {
    return this.formBuilder.group({
      numberOfTrees: [
        '',
        [Validators.required, Validators.min(1), Validators.pattern('[0-9]*')],
      ],
      fertilizer_need: [''],
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
        sect_id: ['', Validators.required],
        cell_id: ['', Validators.required],
        village_id: ['', Validators.required],
      }),
    });
  }

  get formRequests() {
    return this.createForm.get('requests') as FormArray;
  }

  addRequest() {
    (this.createForm.controls.requests as FormArray).push(this.createRequest());
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
    });
    if (this.isUserDistrictCashCrop) {
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
    } else if (this.isUserSiteManager) {
      this.locationService
        .getDistricts(this.site.location.prov_id)
        .subscribe((districts) => {
          this.districts.push(districts);
        });
      const temp = [];
      this.site.coveredAreas.coveredSectors.map((sector) => {
        temp.push({
          _id: sector.sect_id,
          name: sector.name,
        });
      });
      this.sectors.push(temp);
    }
  }

  removeRequest(index: number) {
    (this.createForm.controls.requests as FormArray).removeAt(index);
  }

  getRequestsFormGroup(index): FormGroup {
    this.requestList = this.createForm.get('requests') as FormArray;
    return this.requestList.controls[index] as FormGroup;
  }

  onChangeProvince(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get(
      'prov_id'.toString()
    ).value;
    if (value !== '') {
      this.locationService.getDistricts(value).subscribe((data) => {
        this.districts[index] = data;
        this.sectors[index] = [];
        this.cells[index] = [];
        this.villages[index] = [];
      });
    }
  }

  onChangeDistrict(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get(
      'dist_id'.toString()
    ).value;
    if (value !== '') {
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
        this.locationService.getSectors(value).subscribe((data) => {
          this.sectors[index] = data;
          this.cells[index] = [];
          this.villages[index] = [];
        });
      }
    }
  }

  onChangeSector(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get(
      'sect_id'.toString()
    ).value;
    if (value !== '') {
      if (this.isUserCWSOfficer) {
        this.filterCustomCells(this.org, index);
      } else {
        this.locationService.getCells(value).subscribe((data) => {
          this.cells[index] = data;
          this.villages[index] = [];
        });
      }
    }
  }

  onChangeCell(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get(
      'cell_id'.toString()
    ).value;
    if (value !== '') {
      this.locationService.getVillages(value).subscribe((data) => {
        this.villages[index] = data;
      });
    }
  }



  onSubmit() {
    if (this.createForm.valid) {
      const temp = this.createForm.getRawValue();
      const farmer = {
        requestInfo: [],
      };
      farmer['requestInfo'.toString()] = temp.requests;
      farmer['created_by'.toString()] =
        this.authenticationService.getCurrentUser().info._id;
      this.helper.cleanObject(farmer);
      farmer.requestInfo.map((item) => {
        item['fertilizer_need'.toString()] =
          +item['numberOfTrees'.toString()] *
          this.currentSeason.seasonParams.fertilizerKgPerTree;
        return this.helper.cleanObject(item);
      });
      farmer['id'.toString()] = this.farmerId;
      this.farmerService.addFarmerRequest(farmer).subscribe(
        () => {
          this.modal.close('request successfully added!');
          this.createForm.reset();
        },
        (err) => {
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
    }
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
      'sect_id'.toString()
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
    this.createForm.controls.location
      .get('prov_id'.toString())
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
    this.createForm.controls.location
      .get('dist_id'.toString())
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
    this.createForm.controls.location
      .get('sect_id'.toString())
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
    this.createForm.controls.location
      .get('cell_id'.toString())
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

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
    });
  }

  filterCustomVillages(org: any, villages: any) {
    const temp = [];
    const sectorId = this.createForm.controls.location.get(
      'sect_id'.toString()
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
}
