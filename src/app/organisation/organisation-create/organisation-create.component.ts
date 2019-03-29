import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {OrganisationService, OrganisationTypeService} from '../../core/services';
import {HelperService} from '../../core/helpers';

@Component({
  selector: 'app-organisation-create',
  templateUrl: './organisation-create.component.html',
  styleUrls: ['./organisation-create.component.css']
})
export class OrganisationCreateComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router, private organisationService: OrganisationService,
              private helper: HelperService, private organisationTypeService: OrganisationTypeService) {

  }

  createForm: FormGroup;
  errors: any;
  genres: any[];
  possibleRoles: any[];

  ngOnInit() {

    this.createForm = this.formBuilder.group({
      organizationName: [''],
      email: [''],
      phone_number: [''],
      genreId: [''],
      /* website: [''],*/
      streetNumber: [''],
      organizationRole: new FormArray([])
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
  }

  onSubmit() {
    if (this.createForm.valid) {
      const selectedRoles = this.createForm.value.organizationRole
        .map((checked, index) => checked ? this.possibleRoles[index].value : null)
        .filter(value => value !== null);
      const org = this.createForm.value;
      org['organizationRole'.toString()] = selectedRoles;
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
}
