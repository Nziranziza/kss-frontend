import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {OrganisationService} from '../../core/services';

@Component({
  selector: 'app-organisation-edit',
  templateUrl: './organisation-edit.component.html',
  styleUrls: ['./organisation-edit.component.css']
})
export class OrganisationEditComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder, private router: Router, private organisationService: OrganisationService) {
  }

  editForm: FormGroup;
  errors: string[];

  ngOnInit() {
    const editOrganisationId =  window.localStorage.getItem('editOrganisationId');
    if (!editOrganisationId) {
      alert('Something wrong!');
      this.router.navigateByUrl('admin/organisations/list');
      return;
    }

    this.editForm = this.formBuilder.group({
      id: [],
      email: ['', Validators.required],
      name: ['', Validators.required],
      tin: ['', Validators.required]
    });
    this.organisationService.get(editOrganisationId).subscribe(data => {
      this.editForm.patchValue(data);
    });
  }

  onSubmit() {

    if (this.editForm.valid) {
      this.organisationService.save(this.editForm.value)
      .subscribe(data => {
        if (data.status === 200) {
          this.router.navigateByUrl('admin/organisations/list');
        } else {
          this.errors = data.errors;
        }
      });
    }
  }
}
