import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HelperService} from '../../../core/helpers';
import {AuthenticationService, FarmerService, OrganisationService, SiteService} from '../../../core/services';
import {isPlatformBrowser} from '@angular/common';
import {LocationService} from '../../../core/services';
import {AuthorisationService} from '../../../core/services';

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
  submit = false;
  farmerId: string;
  provinces: any;
  disableProvId = false;
  disableDistId = false;
  districts: any;
  sectors = [];
  cells: any;
  villages: any;
  org: any;
  currentSeason: any;
  isUserCWSOfficer = false;
  isUserSiteManager = false;
  isUserDistrictCashCrop = false;
  site: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder, private locationService: LocationService,
    private helper: HelperService, private farmerService: FarmerService,
    private siteService: SiteService,
    private authenticationService: AuthenticationService,
    private organisationService: OrganisationService,
    private authorisationService: AuthorisationService) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.isUserSiteManager = this.authorisationService.isSiteManager();
    this.isUserDistrictCashCrop = this.authorisationService.isDistrictCashCropOfficer();
    if (this.isUserDistrictCashCrop || this.isUserSiteManager) {
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
      })
    });
    const temp = {
      numberOfTrees: this.land.numberOfTrees,
      fertilizer_allocate: this.land.fertilizer_allocate,
      location: {}
    };
    if (this.isUserDistrictCashCrop || this.isUserSiteManager) {
      this.disableDistId = true;
      this.disableProvId = true;
    }
    this.currentSeason = this.authenticationService.getCurrentSeason();
    this.isUserCWSOfficer = this.authorisationService.isCWSUser();
    this.isUserSiteManager = this.authorisationService.isSiteManager();
    this.isUserDistrictCashCrop = this.authorisationService.isDistrictCashCropOfficer();
    temp.location['prov_id'.toString()] = this.land.location.prov_id._id;
    temp.location['dist_id'.toString()] = this.land.location.dist_id._id;
    temp.location['sect_id'.toString()] = this.land.location.sect_id._id;
    temp.location['cell_id'.toString()] = this.land.location.cell_id._id;
    temp.location['village_id'.toString()] = this.land.location.village_id._id;
    this.organisationService.get(this.authenticationService.getCurrentUser().info.org_id).subscribe(data => {
      this.org = data.content;
    });
    this.initial();
    this.locationService.getDistricts(this.land.location.prov_id._id).subscribe((districts) => {
      this.districts = districts;
    });
    if (this.isUserCWSOfficer) {
      this.organisationService.get(this.authenticationService.getCurrentUser().info.org_id).subscribe(data => {
        data.content.coveredSectors.map((sector) => {
          this.sectors.push({
            _id: sector.sectorId._id,
            name: sector.name
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
            this.filterCustomVillages(this.org);
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
          if (this.isUserCWSOfficer) {
            this.locationService.getVillages(value).toPromise().then(data => {
              const sectorId = this.editFarmerRequestForm.controls.location.get('sect_id'.toString()).value;
              const i = this.org.coveredSectors.findIndex(element => element.sectorId === sectorId);
              const sector = this.org.coveredSectors[i];
              this.villages = [];
              data.map((village) => {
                if (sector.coveredVillages.findIndex((vil) => village._id === vil.village_id) >= 0) {
                  this.villages.push(village);
                }
              });
            });
          } else {
            this.locationService.getVillages(value).subscribe((data) => {
              this.villages = data;
            });
          }
        }
      }
    );
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
    });
  }

  getLocationInput(field: string) {
    return this.editFarmerRequestForm.controls.location.get(field);
  }

  onSubmit() {
    if (this.editFarmerRequestForm.valid) {
      const request = this.editFarmerRequestForm.getRawValue();
      request['fertilizer_need'.toString()] =
        +request['numberOfTrees'.toString()] * this.currentSeason.seasonParams.fertilizerKgPerTree;
      request['documentId'.toString()] = this.farmerId;
      request['subDocumentId'.toString()] = this.land._id;
      request['userId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      request['updated_by'.toString()] = this.authenticationService.getCurrentUser().info._id;
      this.farmerService.updateFarmerRequest(request).subscribe(() => {
          this.setMessage('request successfully updated!');
        },
        (err) => {
          this.setError(err.errors);
        });
    } else {
      this.setError('missing required land(s) information');
    }
  }

  filterCustomSectors(org: any) {
    const temp = [];
    org.coveredSectors.map((sector) => {
      temp.push({
        _id: sector.sectorId,
        name: sector.name
      });
    });
    this.sectors = temp;
  }

  filterCustomCells(org: any) {
    const temp = [];
    const sectorId = this.editFarmerRequestForm.controls.location.get('sect_id'.toString()).value;
    const i = org.coveredSectors.findIndex(element => element.sectorId === sectorId);
    const sector = org.coveredSectors[i];
    sector.coveredCells.map((cell) => {
      temp.push({
        _id: cell.cell_id,
        name: cell.name
      });
    });
    this.cells = temp;
  }

  filterCustomVillages(org: any) {
    const temp = [];
    const sectorId = this.editFarmerRequestForm.controls.location.get('sect_id'.toString()).value;
    const i = org.coveredSectors.findIndex(element => element.sectorId === sectorId);
    const sector = org.coveredSectors[i];
    sector.coveredVillages.map((village) => {
      temp.push({
        _id: village.village_id,
        name: village.name
      });
    });
    this.villages = temp;
  }

  setError(errors: any) {
    this.errors = errors;
    this.message = undefined;
  }

  setMessage(message: string) {
    this.errors = undefined;
    this.message = message;
  }
}
