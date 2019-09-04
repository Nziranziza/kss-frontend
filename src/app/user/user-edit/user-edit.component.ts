import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../core/services';
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
  possibleStatuses = [
    {name: 'Pending', value: 2},
    {name: 'Approved', value: 3},
    {name: 'Locked', value: 4},
    {name: 'Expired', value: 5},
  ];
  invalidId = false;
  org: any;
  sites = [];
  showLocation = {
    province: true,
    district: true,
    sector: true,
    cell: true,
    village: true,
  };
  hasSite = false;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private userService: UserService, private helper: HelperService,
              private organisationService: OrganisationService,
              private siteService: SiteService,
              private locationService: LocationService, private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      foreName: [''],
      surname: [''],
      email: [''],
      phone_number: [''],
      sex: ['', Validators.required],
      NID: [''],
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
    this.route.params.subscribe(params => {
      this.userService.get(params['id'.toString()]).subscribe(user => {
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
        const usr = user.content;
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
    this.initial();
    this.onChanges();
  }

  isSuperOrganisation(organisation: any) {
    if (organisation.organizationRole.indexOf(0) > -1) {
      this.isFromSuperOrg = true;
    } else {
      this.isFromSuperOrg = false;
    }
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
          .filter(value => value !== '');
        if (selectedRoles.includes(6)) {
          this.needLocation = true;
        } else {
          this.needLocation = false;
        }
        if (selectedRoles.includes(8)) {
          this.hasSite = true;
        } else {
          this.hasSite = false;
        }
      });

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
        delete user.distributionSite;
        delete user.accountExpirationDate;
      } else {
        const myDate = user.accountExpirationDate;
        user.accountExpirationDate = new Date(myDate).getTime();
      }
      user['lastModifiedBy'.toString()] = {
        _id: this.authenticationService.getCurrentUser().info._id,
        name: this.authenticationService.getCurrentUser().info.surname
      };
      delete user.email;
      delete user.userType;
      this.helper.cleanObject(user);
      this.helper.cleanObject(user.location);
      this.userService.update(user).subscribe(() => {
          this.router.navigateByUrl('admin/organisations/' + this.organisationId + '/users');
        },
        (err) => {
          this.errors = err.errors;
        });
    }
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
    });
  }
}
