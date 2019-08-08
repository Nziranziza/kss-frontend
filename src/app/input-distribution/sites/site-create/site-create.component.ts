import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {HelperService} from '../../../core/helpers';
import {SiteService} from '../../../core/services/site.service';
import {OrganisationService} from '../../../core/services';
import {LocationService} from '../../../core/services/location.service';

@Component({
  selector: 'app-site-create',
  templateUrl: './site-create.component.html',
  styleUrls: ['./site-create.component.css']
})
export class SiteCreateComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router, private siteService: SiteService,
              private locationService: LocationService,
              private helper: HelperService, private organisationService: OrganisationService) {
  }

  createForm: FormGroup;
  errors: string[];
  organisations: any;
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;

  ngOnInit() {
    this.createForm = this.formBuilder.group({
      siteName: [''],
      belongingZone: [''],
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
    });
    this.organisationService.all().subscribe((data) => {
      this.organisations = data.content;
    });
    this.initial();
    this.onChanges();
  }

  onChanges() {
    this.createForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
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
    this.createForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          const body = {
            searchBy: 'district',
            dist_id: value
          };
          this.siteService.getZone(body).subscribe((data) => {
            this.organisations = data.content;
          });
          this.locationService.getSectors(value).subscribe((data) => {
            this.sectors = data;
            this.cells = null;
            this.villages = null;
          });
        }
      }
    );
    this.createForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getCells(value).subscribe((data) => {
            this.cells = data;
            this.villages = null;
          });
        }
      }
    );
    this.createForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getVillages(value).subscribe((data) => {
            this.villages = data;
          });
        }
      }
    );
  }
  onSubmit() {
    if (this.createForm.valid) {
      const site = JSON.parse(JSON.stringify(this.createForm.value));
      delete site.location;
      this.siteService.save(site)
        .subscribe(data => {
            this.router.navigateByUrl('admin/sites');
          },
          (err) => {
            this.errors = err.errors;
          });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.createForm);
    }
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
    });
  }
}
