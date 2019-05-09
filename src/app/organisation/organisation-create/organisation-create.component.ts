import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {OrganisationService, OrganisationTypeService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {LocationService} from '../../core/services/location.service';

@Component({
  selector: 'app-organisation-create',
  templateUrl: './organisation-create.component.html',
  styleUrls: ['./organisation-create.component.css']
})
export class OrganisationCreateComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router, private organisationService: OrganisationService,
              private helper: HelperService, private organisationTypeService: OrganisationTypeService,
              private locationService: LocationService) {
  }

  createForm: FormGroup;
  errors: any;
  genres: any[];
  possibleRoles: any[];
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  needLocation = false;
  coverVillages = false;
  coveredVillages = [];
  selectedRoles: any;
  villagesOfSector = [];

  ngOnInit() {
    this.createForm = this.formBuilder.group({
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
      organizationRole: new FormArray([]),
      coveredVillages: [[]]
      /*usersNIDRequired: ['']*/
    });

    this.organisationTypeService.all().subscribe(data => {
      this.genres = data.content;
    });
    this.organisationService.possibleRoles().subscribe(data => {
      this.possibleRoles = Object.keys(data.content).map(key => {
        return {name: [key], value: data.content[key]};
      });
      this.possibleRoles.map(role => {
        const control = new FormControl(false);
        (this.createForm.controls.organizationRole as FormArray).push(control);
      });
    });

    this.initial();
    this.onChanges();
  }

  onSubmit() {
    if (this.createForm.valid) {
      const selectedRoles = this.createForm.value.organizationRole
        .map((checked, index) => checked ? this.possibleRoles[index].value : null)
        .filter(value => value !== null);
      const org = this.createForm.value;
      org['organizationRole'.toString()] = selectedRoles;
      if (!(selectedRoles.includes(1) || selectedRoles.includes(2))) {
        delete org.location;
      }
      // is organisation a cws ?
      if (selectedRoles.includes(1)) {
        const temp = [];
        org.coveredVillages.map((id) => {
          const village = this.villagesOfSector.find(obj => obj._id === id);
          temp.push({
            village_id: id,
            name: village.name
          });
        });
        org.coveredVillages = temp;
      }
      this.organisationService.save(org)
        .subscribe(data => {
            this.router.navigateByUrl('admin/organisations');
          },
          (err) => {
            this.errors = err.errors;
          });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.createForm);
    }
  }

  public onMouseDown(event: MouseEvent, item) {
    event.preventDefault();
    event.target['selected'.toString()] = !event.target['selected'.toString()];
    if (event.target['selected'.toString()]) {
      this.createForm.controls['coveredVillages'.toString()].value.push(item._id);
      this.coveredVillages.push(item.name);
    } else {
      let index: number;
      index = this.createForm.value.coveredVillages.indexOf(item._id);
      if (index > -1) {
        this.createForm.controls['coveredVillages'.toString()].value.splice(index, 1);
        this.coveredVillages.splice(index, 1);
      }
    }
  }

  onChanges() {
    this.createForm.controls['organizationRole'.toString()].valueChanges.subscribe(
      (data) => {
        this.selectedRoles = data
          .map((checked, index) => checked ? this.possibleRoles[index].value : null)
          .filter(value => value !== null);
        if (
          this.selectedRoles.includes(1) ||
          this.selectedRoles.includes(2)) {
          this.needLocation = true;
        } else {
          this.needLocation = false;
        }
        if (
          this.selectedRoles.includes(1)) {
          this.coverVillages = true;
        } else {
          this.coverVillages = false;
          this.coveredVillages = [];
          this.createForm.controls.coveredVillages.reset([]);
        }
      });
    this.createForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
            this.createForm.controls.location.get('dist_id'.toString()).setValue('');
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
            this.coveredVillages = [];
            this.villages = null;
          });
          this.locationService.getCoveredVillages(value).subscribe((data) => {
            this.villagesOfSector = data;
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

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
    });
  }
}
