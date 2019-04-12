import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {OrganisationService, OrganisationTypeService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {LocationService} from '../../core/services/location.service';

@Component({
  selector: 'app-organisation-edit',
  templateUrl: './organisation-edit.component.html',
  styleUrls: ['./organisation-edit.component.css']
})
export class OrganisationEditComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router, private helper: HelperService,
              private organisationService: OrganisationService, private locationService: LocationService,
              private organisationTypeService: OrganisationTypeService) {
  }

  editForm: FormGroup;
  errors: any;
  genres: any[];
  possibleRoles: any[];
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  needLocation = false;
  id: string;

  ngOnInit() {

    this.editForm = this.formBuilder.group({
      organizationName: [''],
      email: [''],
      phone_number: [''],
      genreId: [''],
      streetNumber: [''],
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
      organizationRole: new FormArray([])
    });

    this.organisationTypeService.all().subscribe(types => {
      this.genres = types.content;
    });
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
      this.organisationService.get(params['id'.toString()]).subscribe(data => {
        this.organisationService.possibleRoles().subscribe(roles => {
          this.possibleRoles = Object.keys(roles.content).map(key => {
            return {name: [key], value: roles.content[key]};
          });
          this.possibleRoles.map(role => {
            if (data.content.organizationRole.includes(role.value)) {
              const control = new FormControl(true);
              (this.editForm.controls.organizationRole as FormArray).push(control);
            } else {
              const control = new FormControl(false);
              (this.editForm.controls.organizationRole as FormArray).push(control);
            }
          });
        });
        const org = data.content;
        org['genreId'.toString()] = org.genre._id;
        if (
          org.organizationRole.includes(1) ||
          org.organizationRole.includes(2)) {
          if (org.location) {
            org['location'.toString()]['prov_id'.toString()] = org.location.prov_id._id;
            org['location'.toString()]['dist_id'.toString()] = org.location.dist_id._id;
            org['location'.toString()]['sect_id'.toString()] = org.location.sect_id._id;
            org['location'.toString()]['cell_id'.toString()] = org.location.cell_id._id;
            org['location'.toString()]['village_id'.toString()] = org.location.village_id._id;
          }

          this.needLocation = true;
        } else {
          this.needLocation = false;
        }
        this.locationService.getProvinces().subscribe((provinces) => {
          this.provinces = provinces;
        });
        if (org.location) {

          this.locationService.getDistricts(org.location.prov_id).subscribe((districts) => {

            this.districts = districts;
          });
          this.locationService.getSectors(org.location.dist_id).subscribe((sectors) => {
            this.sectors = sectors;
          });
          this.locationService.getCells(org.location.sect_id).subscribe((cells) => {
            this.cells = cells;

          });
          this.locationService.getVillages(org.location.cell_id).subscribe((villages) => {
            this.villages = villages;
          });
        }
        this.editForm.patchValue(org);
        this.onChanges();
      });
    });
  }

  onSubmit() {
    if (this.editForm.valid) {
      const selectedRoles = this.editForm.value.organizationRole
        .map((checked, index) => checked ? this.possibleRoles[index].value : null)
        .filter(value => value !== null);
      const org = this.editForm.value;
      org['organizationRole'.toString()] = selectedRoles;
      if (!(selectedRoles.includes(1) || selectedRoles.includes(2))) {
        delete org.location;
      }
      this.organisationService.update(org, this.id).subscribe(data => {
          this.router.navigateByUrl('admin/organisations');
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editForm);
    }
  }

  onChanges() {

    this.editForm.controls['organizationRole'.toString()].valueChanges.subscribe(
      (data) => {
        const selectedRoles = data
          .map((checked, index) => checked ? this.possibleRoles[index].value : null)
          .filter(value => value !== null);
        if (
          selectedRoles.includes(1) ||
          selectedRoles.includes(2)
        ) {
          this.needLocation = true;
        } else {
          this.needLocation = false;
        }
      });

    this.editForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
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
    this.editForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
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
        if (value !== null) {
          this.locationService.getCells(value).subscribe((data) => {
            this.cells = data;
            this.villages = null;
          });
        }
      }
    );
    this.editForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          this.locationService.getVillages(value).subscribe((data) => {
            this.villages = data;
          });
        }
      }
    );
  }

}
