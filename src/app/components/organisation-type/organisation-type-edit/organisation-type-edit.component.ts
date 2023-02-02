import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {OrganisationTypeService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';

@Component({
  selector: 'app-organisation-type-edit',
  templateUrl: './organisation-type-edit.component.html',
  styleUrls: ['./organisation-type-edit.component.css']
})
export class OrganisationTypeEditComponent implements OnInit {

  constructor(private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute, private router: Router,
              private organisationTypeService: OrganisationTypeService, private helper: HelperService) {
  }

  editForm: UntypedFormGroup;
  errors: string[];

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      _id: ['', Validators.required],
      genre: ['', Validators.required]

    });
    this.route.params.subscribe(params => {
      this.organisationTypeService.get(params['id'.toString()]).subscribe(data => {
        this.editForm.patchValue(data.content);
      });
    });
  }

  onSubmit() {
    if (this.editForm.valid) {
      this.organisationTypeService.save(this.editForm.value).subscribe(data => {
          this.router.navigateByUrl('admin/organisation-types');
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editForm);
    }
  }
}
