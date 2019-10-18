import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs';

import {
  AuthenticationService,
  AuthorisationService, InputDistributionService, LocationService,
  OrganisationService,
  OrganisationTypeService,
  SiteService
} from '../../../core/services';

import {Router} from '@angular/router';
import {HelperService} from '../../../core/helpers';

@Component({
  selector: 'app-distribution-progress',
  templateUrl: './distribution-progress.component.html',
  styleUrls: ['./distribution-progress.component.css']
})
export class DistributionProgressComponent implements OnInit {

  title = 'Application progress';
  checkProgressForm: FormGroup;
  errors: any;
  loading = false;
  message: string;
  isCurrentUserDCC = false;
  distributionProgress: any;

  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  distId = false;
  sectorId = false;
  cellId = false;
  villageId = false;

  constructor(private formBuilder: FormBuilder, private siteService: SiteService,
              private authorisationService: AuthorisationService,
              private authenticationService: AuthenticationService,
              private router: Router, private organisationService: OrganisationService,
              private helper: HelperService, private organisationTypeService: OrganisationTypeService,
              private locationService: LocationService, private inputDistributionService: InputDistributionService) {
  }

  ngOnInit() {
    this.isCurrentUserDCC = this.authorisationService.isDistrictCashCropOfficer();
    this.checkProgressForm = this.formBuilder.group({
      date: this.formBuilder.group({
        from: [''],
        to: ['']
      }),
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.initial();
    this.onFilterProgress();
  }

  onGetProgress(searchBy: string) {
    if (this.checkProgressForm.valid) {
      this.loading = true;
      const request = JSON.parse(JSON.stringify(this.checkProgressForm.value));
      if (request.location.prov_id === '' && searchBy === 'province') {
        delete request.location;
        request['location'.toString()] = {
          searchBy: 'all provinces'
        };
      } else {
        request.location['searchBy'.toString()] = searchBy;
        this.helper.cleanObject(request.location);
      }
      this.inputDistributionService.getDistributionProgress(request).subscribe((data) => {
        this.loading = false;
        if ((data.content.length !== 0) && (data.content)) {
          this.message = '';
          this.errors = '';
          this.distributionProgress = data.content;
        } else {
          this.message = 'Sorry no data found to this location!';
          this.errors = '';
          this.loading = false;
        }
      }, (err) => {
        if (err.status === 404) {
          this.message = 'Sorry no data to this location!';
          this.errors = '';
          this.loading = false;
        } else {
          this.message = '';
          this.errors = err.errors;
        }
      });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.checkProgressForm);
    }
  }

  onFilterProgress() {
    this.checkProgressForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
            this.sectors = null;
            this.cells = null;
            this.villages = null;
          });
        }
      }
    );
    this.checkProgressForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getSectors(value).subscribe((data) => {
            this.sectors = data;
            this.cells = null;
            this.villages = null;
            this.distId = true;
          });
        } else {
          this.distId = false;
        }
      }
    );
    this.checkProgressForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getCells(value).subscribe((data) => {
            this.cells = data;
            this.villages = null;
            this.sectorId = true;
          });
        } else {
          this.sectorId = false;
        }
      }
    );
    this.checkProgressForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getVillages(value).subscribe((data) => {
            this.villages = data;
            this.cellId = true;
          });
        } else {
          this.cellId = false;
        }
      }
    );

    this.checkProgressForm.controls.location.get('village_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.villageId = true;
        } else {
          this.villageId = false;
        }
      }
    );
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
      if (this.isCurrentUserDCC) {
        this.checkProgressForm.controls.location.get('prov_id'.toString())
          .patchValue(this.authenticationService.getCurrentUser().info.location.prov_id);
        this.checkProgressForm.controls.location.get('dist_id'.toString())
          .patchValue(this.authenticationService.getCurrentUser().info.location.dist_id);
      }
    });
  }
}
