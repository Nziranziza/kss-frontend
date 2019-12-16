import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HelperService} from '../../../core/helpers';
import {AuthenticationService, AuthorisationService, FarmerService, SiteService} from '../../../core/services';
import {isPlatformBrowser} from '@angular/common';
import {LocationService} from '../../../core/services';
import {MessageService} from '../../../core/services';
import {Router} from '@angular/router';
import {BasicComponent} from '../../../core/library';

@Component({
  selector: 'app-add-farmer-request',
  templateUrl: './add-farmer-request.component.html',
  styleUrls: ['./add-farmer-request.component.css']
})
export class AddFarmerRequestComponent extends BasicComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() farmerId;
  addFarmerRequestForm: FormGroup;
  provinces = [];
  districts = [];
  sectors = [];
  cells = [];
  villages = [];
  requestIndex = 0;
  currentSeason: any;
  isUserSiteManager = false;
  isUserDistrictCashCrop = false;
  site: any;
  disableProvId = false;
  disableDistId = false;
  provinceValue = '';
  districtValue = '';

  public requestList: FormArray;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object, private  router: Router,
    private injector: Injector, private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private siteService: SiteService,
    private helper: HelperService, private farmerService: FarmerService,
    private messageService: MessageService, private authorisationService: AuthorisationService,
    private locationService: LocationService) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.addFarmerRequestForm = this.formBuilder.group({
      requests: new FormArray([])
    });
    this.currentSeason = this.authenticationService.getCurrentSeason();
    this.isUserDistrictCashCrop = this.authorisationService.isDistrictCashCropOfficer();
    this.isUserSiteManager = this.authorisationService.isSiteManager();
    this.initial();
    if (!(this.isUserSiteManager || this.isUserDistrictCashCrop)) {
      (this.addFarmerRequestForm.controls.requests as FormArray).push(this.createRequest());
    } else {
      this.disableDistId = true;
      this.disableProvId = true;
    }
    if (this.isUserDistrictCashCrop) {
      this.provinceValue = this.authenticationService.getCurrentUser().info.location.prov_id;
      this.districtValue = this.authenticationService.getCurrentUser().info.location.dist_id;
      (this.addFarmerRequestForm.controls.requests as FormArray).push(this.createRequest());
      this.locationService.getDistricts(this.authenticationService.getCurrentUser().info.location.prov_id).subscribe((districts) => {
        this.districts.push(districts);
      });
      this.locationService.getSectors(this.authenticationService.getCurrentUser().info.location.dist_id).subscribe((sectors) => {
        this.sectors.push(sectors);
      });
    } else if (this.isUserSiteManager) {
      this.siteService.get(this.authenticationService.getCurrentUser().orgInfo.distributionSite).subscribe((site) => {
        this.site = site.content;
        this.provinceValue = this.site.location.prov_id._id;
        this.districtValue = this.site.location.dist_id._id;
        (this.addFarmerRequestForm.controls.requests as FormArray).push(this.createRequest());
        this.locationService.getDistricts(this.site.location.prov_id._id).subscribe((districts) => {
          this.districts.push(districts);
        });
        const temp = [];
        this.site.coveredAreas.coveredSectors.map((sector) => {
          temp.push({
            _id: sector.sect_id,
            name: sector.name
          });
        });
        this.sectors.push(temp);
      });
    }
  }

  getLocationInput(i: number, field: string) {
    return this.getRequestsFormGroup(i).controls.location.get(field);
  }

  createRequest(): FormGroup {
    return this.formBuilder.group({
      numberOfTrees: ['', [Validators.required,
        Validators.min(1), Validators.pattern('[0-9]*')]],
      fertilizer_need: [''],
      fertilizer_allocate: [0],
      location: this.formBuilder.group({
        prov_id: [{value: this.provinceValue, disabled: this.disableProvId}, Validators.required],
        dist_id: [{value: this.districtValue, disabled: this.disableDistId}, Validators.required],
        sect_id: ['', Validators.required],
        cell_id: ['', Validators.required],
        village_id: ['', Validators.required]
      })
    });
  }

  get formRequests() {
    return this.addFarmerRequestForm.get('requests') as FormArray;
  }

  addRequest() {
    (this.addFarmerRequestForm.controls.requests as FormArray).push(this.createRequest());
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces.push(data);
    });
    if (this.isUserDistrictCashCrop) {
      this.locationService.getDistricts(this.authenticationService.getCurrentUser().info.location.prov_id).subscribe((districts) => {
        this.districts.push(districts);
      });
      this.locationService.getSectors(this.authenticationService.getCurrentUser().info.location.dist_id).subscribe((sectors) => {
        this.sectors.push(sectors);
      });
    } else if (this.isUserSiteManager) {
      this.locationService.getDistricts(this.site.location.prov_id).subscribe((districts) => {
        this.districts.push(districts);
      });
      const temp = [];
      this.site.coveredAreas.coveredSectors.map((sector) => {
        temp.push({
          _id: sector.sect_id,
          name: sector.name
        });
      });
      this.sectors.push(temp);
    }
  }

  removeRequest(index: number) {
    (this.addFarmerRequestForm.controls.requests as FormArray).removeAt(index);
  }

  getRequestsFormGroup(index): FormGroup {
    this.requestList = this.addFarmerRequestForm.get('requests') as FormArray;
    return this.requestList.controls[index] as FormGroup;
  }

  onChangeProvince(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get('prov_id'.toString()).value;
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
    const value = this.getRequestsFormGroup(index).controls.location.get('dist_id'.toString()).value;
    if (value !== '') {
      this.locationService.getSectors(value).subscribe((data) => {
        this.sectors[index] = data;
        this.cells[index] = [];
        this.villages[index] = [];
      });
    }
  }

  onChangeSector(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get('sect_id'.toString()).value;
    if (value !== '') {
      this.locationService.getCells(value).subscribe((data) => {
        this.cells[index] = data;
        this.villages[index] = [];
      });
    }
  }

  onChangeCell(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get('cell_id'.toString()).value;
    if (value !== '') {
      this.locationService.getVillages(value).subscribe((data) => {
        this.villages[index] = data;
      });
    }
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces.push(data);
    });
  }

  onSubmit() {
    if (this.addFarmerRequestForm.valid) {
      const temp = this.addFarmerRequestForm.getRawValue();
      const farmer = {
        requestInfo: []
      };
      farmer['requestInfo'.toString()] = temp.requests;
      this.helper.cleanObject(farmer);
      farmer.requestInfo.map((item) => {
        item['fertilizer_need'.toString()] = +item['numberOfTrees'.toString()] * this.currentSeason.seasonParams.fertilizerKgPerTree;
        return this.helper.cleanObject(item);
      });
      farmer['id'.toString()] = this.farmerId;
      this.farmerService.addFarmerRequest(farmer).subscribe(() => {
          this.modal.close('request successfully added!');
          this.addFarmerRequestForm.reset();
        },
        (err) => {
          this.setError(err.errors);
        });

    } else {
      if (this.helper.getFormValidationErrors(this.addFarmerRequestForm).length > 0) {
        this.setError(this.helper.getFormValidationErrors(this.addFarmerRequestForm));
      }
      if (this.addFarmerRequestForm.get('requests').invalid) {
        this.setError('Missing required land(s) information');
      }
    }
  }
}
