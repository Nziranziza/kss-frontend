import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {OrganisationService, OrganisationTypeService} from '../../core/services';
import {HelperService} from '../../core/helpers';

@Component({
  selector: 'app-organisation-edit',
  templateUrl: './organisation-edit.component.html',
  styleUrls: ['./organisation-edit.component.css']
})
export class OrganisationEditComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router, private helper: HelperService,
              private organisationService: OrganisationService, private organisationTypeService: OrganisationTypeService) {
  }

  editForm: FormGroup;
  errors: any;
  genres: any[];
  possibleRoles: any[];
  id: string;

  ngOnInit() {

    this.organisationTypeService.all().subscribe(data => {
      this.genres = data.content;
    });

    this.editForm = this.formBuilder.group({
      organizationName: [''],
      email: [''],
      phone_number: [''],
      genreId: [''],
      /* website: [''],*/
      streetNumber: [''],
      organizationRole: new FormArray([])
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
        this.editForm.patchValue(data.content);
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

}
