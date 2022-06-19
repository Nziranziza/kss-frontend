import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {OrganisationTypeService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';

@Component({
  selector: 'app-organisation-type-create',
  templateUrl: './organisation-type-create.component.html',
  styleUrls: ['./organisation-type-create.component.css']
})
export class OrganisationTypeCreateComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router, private organisationTypeService: OrganisationTypeService, private helper: HelperService) {
  }

  createForm: FormGroup;
  errors: string[];

  ngOnInit() {
    this.createForm = this.formBuilder.group({
      genre: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.createForm.valid) {
      const organisationType = this.createForm.value;
      this.organisationTypeService.save(organisationType)
        .subscribe(data => {
            this.router.navigateByUrl('admin/organisation-types');
          },
          (err) => {
            this.errors = err.errors;
          });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.createForm);
    }
  }
}
