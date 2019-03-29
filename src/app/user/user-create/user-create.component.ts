import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../core/services/user.service';
import {OrganisationService} from '../../core/services';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {

  organisationId: string;
  createForm: FormGroup;
  errors: string[];
  userTypes: any[];
  orgPossibleRoles: any[];
  possibleRoles: any[];

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private userService: UserService,
              private organisationService: OrganisationService) {
  }

  ngOnInit() {

    this.createForm = this.formBuilder.group({
      foreName: [''],
      surname: [''],
      email: [''],
      phone_number: [''],
      sex: [''],
      NID: [''],
      password: [''],
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
    });

    this.organisationService.get(this.organisationId).subscribe(data => {
      this.orgPossibleRoles = data.content.organizationRole.map(role => {
        return this.possibleRoles.find(roles => roles.value === role);
      });
      this.orgPossibleRoles.map(role => {
        const control = new FormControl(false);
        (this.createForm.controls.userRoles as FormArray).push(control);
      });
    });
  }

  onSubmit() {
    if (this.createForm.valid) {
      const user = this.createForm.value;
      user['org_id'.toString()] = this.organisationId;
      this.userService.save(user).subscribe(data => {
          this.router.navigateByUrl('admin/organisations/' + this.organisationId + '/users');
        },
        (err) => {
          this.errors = err;
        });

    }
  }
}
