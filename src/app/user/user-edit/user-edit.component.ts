import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../core/services/user.service';
import {OrganisationService} from '../../core/services';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {

  organisationId: string;
  editForm: FormGroup;
  errors: string[];
  userTypes: any[];
  orgPossibleRoles: any[];
  possibleRoles: any[];
  id: string;
  needLocation: false;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private userService: UserService,
              private organisationService: OrganisationService) {
  }

  ngOnInit() {

    this.editForm = this.formBuilder.group({
      foreName: [''],
      surname: [''],
      email: [''],
      phone_number: [''],
      sex: [''],
      NID: [''],
      org_id: [''],
      userType: [''],
      userRoles: new FormArray([])
    });
    this.userService.userTypes().subscribe(data => {
      this.userTypes = Object.keys(data.content).map(key => {
        return {name: key, value: data.content[key]};
      });
    });

    this.organisationService.possibleRoles().subscribe(data => {
      this.possibleRoles = Object.keys(data.content).map(key => {
        return {name: key, value: data.content[key]};
      });
    });

    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
      this.id = params['id'.toString()];
    });
    this.route.params.subscribe(params => {
      this.userService.get(params['id'.toString()]).subscribe(user => {
        this.organisationService.get(this.organisationId).subscribe(data => {
          this.orgPossibleRoles = this.possibleRoles.filter(roles => data.content.organizationRole.includes(roles.value));
          this.orgPossibleRoles.map(role => {
            if (user.content.userRoles.includes(role.value)) {
              const control = new FormControl(true);
              (this.editForm.controls.userRoles as FormArray).push(control);
            } else {
              const control = new FormControl(false);
              (this.editForm.controls.userRoles as FormArray).push(control);
            }
          });
        });
        const usr = user.content;
        console.log(usr);
        this.editForm.patchValue(usr);
      });
    });
  }

  onSubmit() {
    if (this.editForm.valid) {
      const selectedRoles = this.editForm.value.userRoles
        .map((checked, index) => checked ? this.orgPossibleRoles[index].value : null)
        .filter(value => value !== null);
      const user = this.editForm.value;
      user['userRoles'.toString()] = selectedRoles;
      user['org_id'.toString()] = this.organisationId;
      this.userService.update(user, this.id).subscribe(data => {
          this.router.navigateByUrl('admin/organisations/' + this.organisationId + '/users');
        },
        (err) => {
          this.errors = err.errors;
        });
    }
  }
}
