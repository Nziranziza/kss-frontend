import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthorisationService, UserService} from '../../core/services';
import {OrganisationService} from '../../core/services';
import {LocationService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {SiteService} from '../../core/services';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {

  organisationId: string;
  createForm: FormGroup;
  errors = [];
  userTypes: any[];
  orgPossibleRoles = [];
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  loading = false;
  villages: any;
  needLocation = false;
  hasSite = false;
  possibleRoles: any[];
  isFromSuperOrg = false;
  userNIDInfo = {};
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
  selectedType: any;
  selectedRoles: any;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private userService: UserService,
              private siteService: SiteService,
              private helper: HelperService,
              private authorisationService: AuthorisationService,
              private organisationService: OrganisationService,
              private locationService: LocationService) {
  }

  ngOnInit() {
    this.createForm = this.formBuilder.group({
      foreName: [''],
      surname: [''],
      email: [''],
      phone_number: [''],
      sex: ['', Validators.required],
      NID: [''],
      password: [''],
      org_id: [''],
      userType: [],
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
      accountExpirationDate: [''],
      distributionSite: [''],
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
      this.getRoles();
    });
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
    });
    this.initial();
    this.onChanges();
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
        this.userNIDInfo['surname'.toString()] = data.content.surname;
        this.userNIDInfo['sex'.toString()] = data.content.sex.toLowerCase();
        this.createForm.patchValue(this.userNIDInfo);
        this.loading = false;
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

  onSubmit() {
    if (this.createForm.valid) {
      const selectedRoles = this.createForm.value.userRoles
        .map((checked, index) => checked ? this.orgPossibleRoles[index].value : null)
        .filter(value => value !== null);
      const user = JSON.parse(JSON.stringify(this.createForm.value));
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
            if (checkNIDBody.nid !== '') {
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
                (err) => {
                  this.errors = err.errors;
                });
            }
          }
        },
        (err) => {
          this.errors = err.errors;
        },
        () => {
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
            user.accountExpirationDate = this.helper.getDate(this.createForm.value.accountExpirationDate);
          }

          this.helper.cleanObject(user);
          this.helper.cleanObject(user.location);
          this.userService.save(user).subscribe(() => {
              this.router.navigateByUrl('admin/organisations/' + this.organisationId + '/users');
            },
            (err) => {
              this.errors = err.errors;
            });
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.createForm);
    }
  }

  onChanges() {
    this.createForm.controls['userRoles'.toString()].valueChanges.subscribe(
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

        /*If selected roles include NAEB, get corresponding user permissions*/
        if (selectedRoles.includes(4)) {
          this.userService.userPermissions(4).subscribe(dt => {
            this.userTypes = Object.keys(dt.content).map(key => {
              return {name: key, value: dt.content[key]};
            });
          });
        }
        this.selectedRoles = selectedRoles;
      }
    );
    this.createForm.controls['userType'.toString()].valueChanges.subscribe(
      (value) => {
        if (+value === 2) {
          this.selectedType = +value;
          this.hasSite = !!this.selectedRoles.includes(8);
        } else {
          this.hasSite = false;
        }
      }
    );
    this.createForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
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
    this.createForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
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
    this.createForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getCells(value).subscribe((data) => {
            this.cells = data;
            this.villages = null;
          });
        }
      }
    );
    this.createForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
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

  getRoles() {
    this.organisationService.get(this.organisationId).subscribe(data => {
      this.org = data.content;
      this.isSuperOrganisation(data.content);
      this.orgPossibleRoles = this.possibleRoles.filter(roles => data.content.organizationRole.includes(roles.value));
      this.orgPossibleRoles.map(() => {
        const control = new FormControl(false);
        (this.createForm.controls.userRoles as FormArray).push(control);
      });
    });
  }
}
