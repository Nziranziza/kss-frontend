import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FarmService, HelperService} from '../../../../core';
import {AuthenticationService, FarmerService, OrganisationService, SiteService} from '../../../../core';
import {isPlatformBrowser} from '@angular/common';
import {LocationService} from '../../../../core';
import {AuthorisationService} from '../../../../core';

@Component({
  selector: 'app-edit-farmer-request',
  templateUrl: './edit-farmer-request.component.html',
  styleUrls: ['./edit-farmer-request.component.css']
})
export class EditFarmerRequestComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() land;
  editFarmerRequestForm: FormGroup;
  errors: any;
  message: string;
  save = false;
  loading = false;
  farmerId: string;
  provinces: any;
  disableProvId = false;
  disableDistId = false;
  districts: any;
  sectors = [];
  treeVarieties: any;
  ranges = ['0-3', '4-10', '11-15', '16-20', '21-25', '26-30', '31+'];
  certificates: any;
  cells: any;
  villages: any;
  org: any;
  currentSeason: any;
  isUserCWSOfficer = false;
  isUserSiteManager = false;
  isUserDistrictCashCrop = false;
  site: any;
  upi: any;
  validForm = true;
  province: any;
  district: any;
  sector: any;
  cell: any;
  village: any;


  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder, private locationService: LocationService,
    private helper: HelperService, private farmerService: FarmerService,
    private siteService: SiteService,
    private farmService: FarmService,
    private authenticationService: AuthenticationService,
    private organisationService: OrganisationService,
    private authorisationService: AuthorisationService) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.isUserCWSOfficer = this.authorisationService.isCWSUser();
    this.isUserSiteManager = this.authorisationService.isSiteManager();
    this.isUserDistrictCashCrop = this.authorisationService.isDistrictCashCropOfficer();
    if (this.isUserSiteManager || this.isUserDistrictCashCrop || this.isUserCWSOfficer) {
      this.disableDistId = true;
      this.disableProvId = true;
    }
    this.editFarmerRequestForm = this.formBuilder.group({
      numberOfTrees: ['', [Validators.required, Validators.pattern('[0-9]*')]],
      fertilizer_allocate: [0],
      location: this.formBuilder.group({
        prov_id: [{value: '', disabled: this.disableProvId}, Validators.required],
        dist_id: [{value: '', disabled: this.disableDistId}, Validators.required],
        sect_id: ['', Validators.required],
        cell_id: ['', Validators.required],
        village_id: ['', Validators.required]
      }),
      upiNumber: [''],
      landOwner: [''],
      longitudeCoordinate: [''],
      latitudeCoordinate: [''],
      active: [''],
      certificates: new FormArray([]),
      treeAges: new FormArray([])
    });
    const temp = {
      numberOfTrees: this.land.numberOfTrees,
      fertilizer_allocate: this.land.fertilizer_allocate,
      landOwner: this.land.landOwner ? this.land.landOwner : '',
      upiNumber: this.land.upiNumber ? this.land.upiNumber : '',
      certificates: this.land.certificates ? this.land.certificates : [],
      treeAges: this.land.treeAges ? this.land.treeAges : [],
      longitudeCoordinate: this.land.longitudeCoordinate ? this.land.longitudeCoordinate : '',
      latitudeCoordinate: this.land.latitudeCoordinate ? this.land.latitudeCoordinate : '',
      active: this.land.active ? this.land.active : '',
      location: {}
    };
    if (temp.certificates) {
      temp.certificates.map((certificate) => {
        this.addCertificate();
      });
    }

    this.currentSeason = this.authenticationService.getCurrentSeason();
    temp.location['prov_id'.toString()] = this.land.location.prov_id._id;
    temp.location['dist_id'.toString()] = this.land.location.dist_id._id;
    temp.location['sect_id'.toString()] = this.land.location.sect_id._id;
    temp.location['cell_id'.toString()] = this.land.location.cell_id._id;
    temp.location['village_id'.toString()] = this.land.location.village_id._id;
    this.organisationService.get(this.authenticationService.getCurrentUser().info.org_id).subscribe(data => {
      this.org = data.content;
    });
    this.farmService.listTreeVarieties().subscribe((data) => {
        this.treeVarieties = data.data;
        this.createAgeRanges();
        if (this.land.treeAges) {
          this.editFarmerRequestForm.controls.treeAges.patchValue(this.land.treeAges);
          this.land.treeAges.map((age, i) => {
            age.varieties.map((variety, v) => {
              if (variety.number > 0) {
                this.formTreeVarieties(i).at(v).get('selected').setValue(true);
              }
            });
          });
        }
      }
    );

    this.initial();
    this.locationService.getDistricts(this.land.location.prov_id._id).subscribe((districts) => {
      this.districts = districts;
    });
    if (this.isUserCWSOfficer) {
      this.organisationService.get(this.authenticationService.getCurrentUser().info.org_id).subscribe(data => {
        data.content.coveredSectors.map((sector) => {
          this.sectors.push({
            _id: sector.sectorId._id,
            name: sector.sectorId.name
          });
        });
      });
    } else if (this.isUserSiteManager) {
      this.siteService.get(this.authenticationService.getCurrentUser().orgInfo.distributionSite).subscribe((site) => {
        this.site = site.content;
        this.site.coveredAreas.coveredSectors.map((sector) => {
          this.sectors.push({
            _id: sector.sect_id,
            name: sector.name
          });
        });
      });

    } else {
      this.locationService.getSectors(this.land.location.dist_id._id).subscribe((sectors) => {
        this.sectors = sectors;
      });
    }
    this.locationService.getCells(this.land.location.sect_id._id).subscribe((cells) => {
      this.cells = cells;
    });
    this.locationService.getVillages(this.land.location.cell_id._id).subscribe((villages) => {
      this.villages = villages;
    });
    this.editFarmerRequestForm.patchValue(temp, {emitEvent: false});
    this.onChanges();
  }

  createCertificate(): FormGroup {
    return this.formBuilder.group({
      name: [''],
      identificationNumber: ['']
    });
  }

  get formTreeAges() {
    return this.editFarmerRequestForm.get('treeAges') as FormArray;
  }

  formTreeVarieties(i: number) {
    return this.formTreeAges.at(i).get('varieties') as FormArray;
  }

  addTreeVariety(i: number) {
    this.formTreeVarieties(i).push(this.formBuilder.group({
      selected: [false],
      number: [0]
    }));
  }

  createAgeRanges() {
    this.ranges.forEach((range, i) => {
      this.formTreeAges.push(
        this.formBuilder.group({
          range,
          numOfTrees: [0],
          varieties: new FormArray([])
        }));
      this.treeVarieties.forEach((variety, t) => {
        this.formTreeVarieties(i).push(
          this.formBuilder.group({
            selected: [false],
            number: [0]
          }));
      });
    });
  }


  get formCertificates() {
    return this.editFarmerRequestForm.get('certificates') as FormArray;
  }

  addCertificate() {
    (this.editFarmerRequestForm.controls.certificates as FormArray).push(this.createCertificate());
  }

  removeCertificate(index: number) {
    (this.editFarmerRequestForm.controls.certificates as FormArray).removeAt(index);
  }

  getCertificateFormGroup(index): FormGroup {
    this.certificates = this.editFarmerRequestForm.get('certificates') as FormArray;
    return this.certificates.controls[index] as FormGroup;
  }

  onChanges() {
    this.editFarmerRequestForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
            this.sectors = null;
            this.cells = null;
            this.villages = null;
          });
          if (this.isUserSiteManager && (!this.isUserCWSOfficer)) {
            const temp = [];
            this.site.coveredAreas.coveredSectors.map((sector) => {
              temp.push({
                _id: sector.sect_id,
                name: sector.name
              });
            });
            this.sectors.push(temp);
          } else if (this.isUserCWSOfficer) {
            this.filterCustomSectors(this.org);
          } else {
            this.locationService.getSectors(value).toPromise().then(data => {
              this.sectors = data;
              this.cells = [];
              this.villages = [];
            });
          }
        }
      }
    );
    this.editFarmerRequestForm.controls.treeAges.valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          this.validForm = this.validateNumbers(value);
          this.save = this.validForm;
        }
      });
    this.editFarmerRequestForm.controls.numberOfTrees.valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          this.validForm = this.validateNumbers(this.editFarmerRequestForm.controls.treeAges.value);
          this.save = this.validForm;
        }
      });
    this.editFarmerRequestForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          this.locationService.getSectors(value).subscribe((data) => {
            this.sectors = data;
            this.cells = null;
            this.villages = null;
          });
          if (this.isUserCWSOfficer) {
            this.filterCustomCells(this.org);
          } else {
            this.locationService.getCells(value).toPromise().then(data => {
              this.cells = data;
              this.villages = [];
            });
          }
        }
      }
    );
    this.editFarmerRequestForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          this.locationService.getCells(value).subscribe((data) => {
            this.cells = data;
            this.villages = null;
          });
          if (this.isUserCWSOfficer) {
            this.filterCustomCells(this.org);
          } else {
            this.locationService.getVillages(value).toPromise().then(data => {
              this.villages = data;
            });
          }
        }
      }
    );
    this.editFarmerRequestForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
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

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
    });
  }

  updateList(i: number, v: number) {
    const value = this.editFarmerRequestForm.controls.treeAges.value;
    const sum = value[i].varieties.map(item => item.number).reduce((prev, curr) => prev + curr, 0);
    this.formTreeAges.at(i).get('numOfTrees').setValue(sum, {emitEvent: true});
    if (this.formTreeVarieties(i).at(v).get('number').value !== 0) {
      this.formTreeVarieties(i).at(v).get('selected').setValue(true);
    } else {
      this.formTreeVarieties(i).at(v).get('selected').setValue(false);
    }
  }

  getLocationInput(field: string) {
    return this.editFarmerRequestForm.controls.location.get(field);
  }

  onSubmit() {
    this.editFarmerRequestForm.markAllAsTouched();
    if (this.editFarmerRequestForm.valid) {
      this.loading = true;
      const request = this.editFarmerRequestForm.getRawValue();
      request['fertilizer_need'.toString()] =
        +request['numberOfTrees'.toString()] * this.currentSeason.seasonParams.fertilizerKgPerTree;
      request['documentId'.toString()] = this.farmerId;
      request['subDocumentId'.toString()] = this.land._id;
      request['userId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      request['updated_by'.toString()] = this.authenticationService.getCurrentUser().info._id;
      this.helper.cleanObject(request);
      request.treeAges.map((range) => {
        range.varieties.map((variety, index) => {
          variety.varietyId = this.treeVarieties[index]._id;
          delete variety.selected;
        });
      });
      this.farmerService.updateFarmerRequest(request).subscribe(() => {
          this.setMessage('request successfully updated!');
          this.modal.dismiss();
          this.loading = true;
        },
        (err) => {
          this.setError(err.errors);
          this.loading = true;
        });
    } else {
      this.setError('missing required land(s) information');
      this.loading = true;
    }
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
    const sectorId = this.editFarmerRequestForm.controls.location.get('sect_id'.toString()).value;
    const i = org.coveredSectors.findIndex(element => element.sectorId._id === sectorId);
    const sector = org.coveredSectors[i];
    sector.coveredCells.map((cell) => {
      temp.push({
        _id: cell.cell_id,
        name: cell.name
      });
    });
    this.cells = temp;
  }

  filterCustomVillages(org: any, villages: any) {
    const temp = [];
    const sectorId = this.editFarmerRequestForm.controls.location.get('sect_id'.toString()).value;
    const i = org.coveredSectors.findIndex(element => element.sectorId._id === sectorId);
    const sector = org.coveredSectors[i];
    sector.coveredVillages.map((village) => {
      if (villages.findIndex(el => el._id === village.village_id)) {
        temp.push({
          _id: village.village_id,
          name: village.name
        });
      }
    });
    this.villages = temp;
  }

  validateUPI(upi: string) {
    if (upi.length >= 15) {
      const body = {
        upiNumber: upi
      };
      this.farmService.validateUPI(body).subscribe((data) => {
          console.log(data);
          this.upi = data.data;
          const locationNames = {
            province: this.upi.parcelLocation.province.provinceName.toUpperCase(),
            district: this.upi.parcelLocation.district.districtName.charAt(0).toUpperCase() + this.upi.parcelLocation.district.districtName.slice(1).toLowerCase(),
            sector: this.upi.parcelLocation.sector.sectorName.charAt(0).toUpperCase() + this.upi.parcelLocation.sector.sectorName.slice(1).toLowerCase(),
            cell: this.upi.parcelLocation.cell.cellName.charAt(0).toUpperCase() + this.upi.parcelLocation.cell.cellName.slice(1).toLowerCase(),
            village: this.upi.parcelLocation.village.villageName.charAt(0).toUpperCase() + this.upi.parcelLocation.village.villageName.slice(1).toLowerCase()
          };
          this.locationService.getZoningIDS(locationNames).subscribe((location) => {
            this.editFarmerRequestForm.controls.location.get('prov_id').setValue(location.province._id);
            this.editFarmerRequestForm.controls.location.get('dist_id').setValue(location.district._id, {emitEvent: true});
            this.editFarmerRequestForm.controls.location.get('sect_id').setValue(location.sector._id, {emitEvent: true});
            this.editFarmerRequestForm.controls.location.get('cell_id').setValue(location.cell._id, {emitEvent: true});
            this.editFarmerRequestForm.controls.location.get('village_id').setValue(location.cell._id, {emitEvent: true});
          });
          this.editFarmerRequestForm.controls.landOwner.setValue(this.upi.representative.surname +
            ' ' + this.upi.representative.foreNames);
          if (!Object.keys(this.upi).length) {
            this.setError(['UPI not found']);
          }
        },
        (error) => {
          console.log(error);
          this.editFarmerRequestForm.controls.landOwner.reset();
          this.setError(['UPI not found']);
        });
    }
  }

  validateNumbers(value: any) {
    const numberOfTrees = this.editFarmerRequestForm.controls.numberOfTrees.value;
    const sumAllNumOfTrees = value.map(item => item.numOfTrees).reduce((prev, curr) => prev + curr, 0);
    const found = value.findIndex((range) => {
      const sumAllNumber = range.varieties.map(item => item.number).reduce((prev, curr) => prev + curr, 0);
      return range.numOfTrees !== sumAllNumber;
    });
    return !((found !== -1) || (numberOfTrees !== sumAllNumOfTrees));
  }

  setError(errors: any) {
    this.errors = errors;
    this.message = undefined;
  }

  setMessage(message: string) {
    this.errors = undefined;
    this.message = message;
  }

  titleCase(word: string) {
    return word[0].toUpperCase() + word.substr(1).toLowerCase();
  }
}
