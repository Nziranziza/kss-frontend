import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../core/services/user.service';
import {OrganisationService} from '../../core/services';
import {LocationService} from '../../core/services/location.service';

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
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  needLocation = false;
  possibleRoles: any[];
  isFromSuperOrg = false;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private userService: UserService,
              private organisationService: OrganisationService,
              private locationService: LocationService) {
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
      userType: [1],
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
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
      this.isSuperOrganisation(data.content);
      this.orgPossibleRoles = this.possibleRoles.filter(roles => data.content.organizationRole.includes(roles.value));
      this.orgPossibleRoles.map(role => {
        const control = new FormControl(false);
        (this.createForm.controls.userRoles as FormArray).push(control);
      });
    });
    this.initial();
    this.onChanges();
  }

  isSuperOrganisation(organisation: any) {
    if (organisation.organizationRole.indexOf(0) > -1) {
      this.isFromSuperOrg  = true;
    } else {
      this.isFromSuperOrg = false;
    }
  }

  onSubmit() {
    if (this.createForm.valid) {
      const selectedRoles = this.createForm.value.userRoles
        .map((checked, index) => checked ? this.orgPossibleRoles[index].value : null)
        .filter(value => value !== null);
      const user = this.createForm.value;
      user['userRoles'.toString()] = selectedRoles;
      user['org_id'.toString()] = this.organisationId;

      /*--------------------------------- Check user ------------------------------*/
      const checkEmailBody = {
        email: user.email,
        reason: 'registration'
      };
      const checkNIDBody = {
        nid: user.NID,
        reason: 'registration'
      };
      user['action'.toString()] = 'create';
      this.userService.checkEmail(checkEmailBody).subscribe(data => {
          const response = data.content;
          if (response.existsInCas) {
            this.errors = ['User with this email already exists'];
            return;
          }
          if (response.existsInSns) {
            user['action'.toString()] = 'import';
          }
          if (!(response.existsInCas || response.existsInSns)) {
            this.userService.checkNID(checkNIDBody).subscribe(result => {
                const res = result.content;
                if (res.existsInCas) {
                  this.errors = ['User with this NID already exists'];
                  return;
                }
                if (res.existsInSns) {
                  user['action'.toString()] = 'import';
                }
              },
              () => {
              });
          }
        },
        () => {
        });

      if (!(selectedRoles.includes(6) || selectedRoles.includes(7))) {
        delete user.location;
      }
      this.userService.save(user).subscribe(data => {
          this.router.navigateByUrl('admin/organisations/' + this.organisationId + '/users');
        },
        (err) => {
          this.errors = err.errors;
        });
    }
  }

  onChanges() {

    this.createForm.controls['userRoles'.toString()].valueChanges.subscribe(
      (data) => {
        const selectedRoles = data
          .map((checked, index) => checked ? this.orgPossibleRoles[index].value : null)
          .filter(value => value !== null);
        if (
          selectedRoles.includes(6) ||
          selectedRoles.includes(7)
        ) {
          this.needLocation = true;
        } else {
          this.needLocation = false;
        }
      });

    this.createForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
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
    this.createForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
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
    this.createForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          this.locationService.getCells(value).subscribe((data) => {
            this.cells = data;
            this.villages = null;
          });
        }
      }
    );
    this.createForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
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
