import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {SiteService} from '../../../core/services/site.service';
import {LocationService} from '../../../core/services/location.service';
import {HelperService} from '../../../core/helpers';
import {OrganisationService} from '../../../core/services';

@Component({
  selector: 'app-site-edit',
  templateUrl: './site-edit.component.html',
  styleUrls: ['./site-edit.component.css']
})
export class SiteEditComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute,
              private router: Router, private siteService: SiteService,
              private locationService: LocationService,
              private helper: HelperService, private organisationService: OrganisationService) {
  }

  editForm: FormGroup;
  errors: string[];
  organisations: any;
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  id: string;

  ngOnInit() {
    this.editForm = this.formBuilder.group({
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
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
      this.siteService.get(params['id'.toString()]).subscribe(data => {
        this.editForm.patchValue(data.content);
      });
    });
    this.initial();
    this.onChanges();
  }

  onChanges() {
    this.editForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
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
    this.editForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
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
    this.editForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getCells(value).subscribe((data) => {
            this.cells = data;
            this.villages = null;
          });
        }
      }
    );
    this.editForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getVillages(value).subscribe((data) => {
            this.villages = data;
            this.onChanges();
          });
        }
      }
    );
  }
  onSubmit() {
    if (this.editForm.valid) {
      const site = JSON.parse(JSON.stringify(this.editForm.value));
      delete site.location;
      this.siteService.update(this.id, site)
        .subscribe(() => {
            this.router.navigateByUrl('admin/sites');
          },
          (err) => {
            this.errors = err.errors;
          });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editForm);
    }
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
    });
  }
}
