import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MessageService, UserService} from '../../core/services';
import {AuthenticationService, OrganisationService} from '../../core/services';
import {LocationService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {SiteService} from '../../core/services';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})

export class UserEditComponent implements OnInit {

  organisationId: string;
  editForm: FormGroup;
  errors = [];
  userTypes: any[];
  orgPossibleRoles: any[];
  possibleRoles: any[];
  id: string;
  needLocation = false;
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  isFromSuperOrg = false;
  userNIDInfo = {};
  loading = false;
  editUser: any;
  isFullyEditable = false;
  possibleStatuses = [
    {name: 'Pending', value: 2},
    {name: 'Approved', value: 3},
    {name: 'Locked', value: 4},
    {name: 'Expired', value: 5},
  ];
  invalidId = false;
  org: any;
  sites = [];
  selectedType: any;
  selectedRoles: any;
  showLocation = {
    province: true,
    district: true,
    sector: true,
    cell: true,
    village: true,
  };
  hasSite = false;
  hideEmail = false;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private userService: UserService, private helper: HelperService,
              private organisationService: OrganisationService,
              private siteService: SiteService,
              private messageService: MessageService,
              private locationService: LocationService,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      foreName: [''],
      surname: [''],
      email: [''],
      phone_number: [''],
      sex: ['', Validators.required],
      NID: [{value: '', disabled: true}],
      org_id: [''],
      userType: [''],
      userRoles: new FormArray([]),
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
      accountExpirationDate: [''],
      distributionSite: [''],
      status: ['']
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

    this.initial();
    this.onChanges();
    this.route.params.subscribe(params => {
      this.userService.get(params['id'.toString()]).subscribe(user => {
        console.log(user);
        this.organisationService.get(this.organisationId).subscribe(data => {
          this.org = data.content;
          this.isSuperOrganisation(data.content);
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
        this.editUser = user.content;
        this.isFullyEditable = !!this.editUser.fullyEditable;
        if (!this.isFullyEditable) {
          this.editForm.controls.email.disable();
        }
        const usr = user.content;
        if (usr.userRoles.includes(4)) {
          this.userService.userPermissions(4).subscribe(dt => {
            this.userTypes = Object.keys(dt.content).map(key => {
              return {name: key, value: dt.content[key]};
            });
          });
        }
        usr.hasAccessTo.map(access => {
          if (access.app === 2) {
            usr['userType'.toString()] = access.userType;
          }
        });
        if (usr.sex !== undefined) {
          usr['sex'.toString()] = usr['sex'.toString()].toLowerCase();
        }
        if (usr.accountExpirationDate !== undefined) {
          usr['accountExpirationDate'.toString()] = usr['accountExpirationDate'.toString()];
        }
        this.editForm.patchValue(usr);
      });
    });

  }

  isSuperOrganisation(organisation: any) {
    this.isFromSuperOrg = organisation.organizationRole.indexOf(0) > -1;
  }

  onInputNID(nid: string) {
    if (nid.length >= 16) {
      this.loading = true;
      this.deleteErrors();
      this.userService.verifyNID(nid).subscribe(data => {
        this.userNIDInfo['foreName'.toString()] = data.content.foreName;
        this.userNIDInfo['surname'.toString()] = data.content.fatherName;
        this.userNIDInfo['sex'.toString()] = data.content.sex;
        this.editForm.patchValue(this.userNIDInfo);
        this.invalidId = false;
      }, () => {
        this.invalidId = true;
        this.loading = false;
      });
    }
  }

  deleteErrors() {
    this.errors = [];
  }

  onChanges() {
    this.editForm.controls['userRoles'.toString()].valueChanges.subscribe(
      (data) => {
        const selectedRoles = data
          .map((checked, index) => checked ? this.orgPossibleRoles[index].value : null)
          .filter(value => value !== null);
        this.needLocation = !!selectedRoles.includes(6);
        if (selectedRoles.includes(8)) {
          if (this.selectedType === 2) {
            this.hasSite = true;
          }
        } else {
          this.hasSite = false;
        }

        this.hasSite = !!(selectedRoles.includes(8) && selectedRoles.includes(1));
        selectedRoles.forEach((role) => {
          this.userService.userPermissions(role).subscribe(dt => {
            this.userTypes = Object.keys(dt.content).map(key => {
              return {name: key, value: dt.content[key]};
            });
          });
        });
        this.selectedRoles = selectedRoles;
      }
    );
    this.editForm.controls['userType'.toString()].valueChanges.subscribe(
      (value) => {
        this.hideEmail = +value === 13;
        if (+value === 2) {
          this.selectedType = +value;
          this.hasSite = !!this.selectedRoles.includes(8);
        } else {
          this.hasSite = !!(this.selectedRoles.includes(8) && this.selectedRoles.includes(1));
        }
      }
    );

    this.editForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
            this.sectors = null;
            this.cells = null;
            this.villages = null;
          });
          if (this.hasSite) {
            const body = {
              searchBy: 'province',
              prov_id: value
            };
            this.siteService.all(body).subscribe((data) => {
              this.sites = data.content;
            });
          }
        }
      }
    );
    this.editForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getSectors(value).subscribe((data) => {
            this.sectors = data;
            this.cells = null;
            this.villages = null;
          });
          if (this.hasSite) {
            const body = {
              searchBy: 'district',
              dist_id: value
            };
            this.siteService.all(body).subscribe((data) => {
              this.sites = data.content;
            });
          }
        }
      }
    );
    this.editForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getCells(value).subscribe((data) => {
            this.cells = data;
            this.villages = null;
          });
        }
      }
    );
    this.editForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getVillages(value).subscribe((data) => {
            this.villages = data;
          });
        }
      }
    );
  }

  onSubmit() {
    if (this.editForm.valid) {
      const selectedRoles = this.editForm.value.userRoles
        .map((checked, index) => checked ? this.orgPossibleRoles[index].value : null)
        .filter(value => value !== null);
      const user = JSON.parse(JSON.stringify(this.editForm.value));
      user['userRoles'.toString()] = selectedRoles;
      user['org_id'.toString()] = this.organisationId;
      user['id'.toString()] = this.id;
      if (this.isFromSuperOrg) {
        user['userRoles'.toString()] = [0];
      }
      if ((!(selectedRoles.includes(6)) && (!(selectedRoles.includes(8))))) {
        delete user.location;
      }
      if (!selectedRoles.includes(8)) {
        delete user.accountExpirationDate;
      } else {
        const myDate = this.helper.getDate(this.editForm.value.accountExpirationDate);
        user.accountExpirationDate = new Date(myDate).getTime();
      }
      user['lastModifiedBy'.toString()] = {
        _id: this.authenticationService.getCurrentUser().info._id,
        name: this.authenticationService.getCurrentUser().info.surname
      };
      // delete user.userType;
      this.helper.cleanObject(user);
      this.helper.cleanObject(user.location);
      if (!((this.editUser.fullyEditable) && (this.editUser.email !== user.email))) {
        delete user.email;
      }
      this.userService.update(user).subscribe(() => {
          this.messageService.setMessage('user successfully updated.');
          this.router.navigateByUrl('admin/organisations/' + this.organisationId + '/users');
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editForm);
    }
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
    });
  }
}
