import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService, ConfirmDialogService, FarmerService, OrganisationService, SiteService} from '../../core/services';
import {LocationService} from '../../core/services';
import {UserService} from '../../core/services';
import {MessageService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {isArray, isUndefined} from 'util';
import {AuthorisationService} from '../../core/services';
import {Location} from '@angular/common';
import {BasicComponent} from '../../core/library';

@Component({
  selector: 'app-farmer-create',
  templateUrl: './farmer-create.component.html',
  styleUrls: ['./farmer-create.component.css']
})
export class FarmerCreateComponent extends BasicComponent implements OnInit, OnDestroy {

  createForm: FormGroup;
  provinces: any = [];
  districts: any = [];
  sectors: any = [];
  cells: any = [];
  villages: any = [];
  requestIndex = 0;
  farmer: any;
  createFromPending = false;
  isGroup = false;
  id: string;
  submit = false;
  loading = false;
  invalidId = false;
  currentSeason: any;
  isUserCWSOfficer = false;
  isUserDistrictCashCrop = false;
  isUserSiteManager = false;
  user: any;
  site: any;
  disableProvId = false;
  disableDistId = false;
  provinceValue = '';
  districtValue = '';
  sectorValue = '';
  cellValue = '';
  villageValue = '';

  public requestList: FormArray;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private farmerService: FarmerService,
              private userService: UserService,
              private organisationService: OrganisationService,
              private siteService: SiteService,
              private confirmDialogService: ConfirmDialogService,
              private authenticationService: AuthenticationService,
              private authorisationService: AuthorisationService,
              private locationService: LocationService, private messageService: MessageService,
              private helperService: HelperService, private location: Location) {
    super();
  }

  ngOnInit() {
    this.createForm = this.formBuilder.group({
      foreName: [''],
      surname: [''],
      groupName: [''],
      phone_number: [''],
      sex: ['m'],
      NID: [''],
      type: ['', Validators.required],
      groupContactPerson: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        phone: ['']
      }),
      requests: new FormArray([])
    });
    this.currentSeason = this.authenticationService.getCurrentSeason();
    this.isUserCWSOfficer = this.authorisationService.isCWSUser();
    this.isUserDistrictCashCrop = this.authorisationService.isDistrictCashCropOfficer();
    this.isUserSiteManager = this.authorisationService.isSiteManager();
    this.user = this.authenticationService.getCurrentUser();
    if (this.isUserSiteManager || this.isUserDistrictCashCrop || this.isUserCWSOfficer) {
      this.disableDistId = true;
      this.disableProvId = true;
    }
    this.route.params
      .subscribe(params => {
        if (params.id !== undefined) {
          this.createFromPending = true;
          this.id = params.id;
        }
      });
    if (this.createFromPending) {
      this.farmerService.getPendingFarmer(this.id).subscribe(data => {
          this.farmer = data.content;
          this.createFromPending = true;
          this.siteService.get(this.authenticationService.getCurrentUser().orgInfo.distributionSite).subscribe((site) => {
            this.site = site.content;
          });
          const temp = {
            foreName: this.farmer.foreName,
            surname: this.farmer.surname,
            groupName: this.farmer.surname,
            phone_number: this.farmer.phone_number,
            NID: this.farmer.NID,
            requests: [{
              numberOfTrees: this.farmer.numberOfTrees,
              fertilizer_need: this.farmer.fertilizer_need,
              fertilizer_allocate: this.farmer.fertilizer_allocate
            }]
          };

          if (this.farmer.NID !== '') {
            this.verifyNID(this.farmer.NID);
          }
          if (!isUndefined(this.farmer.location)) {
            this.provinceValue = this.farmer.location.prov_id;
            this.districtValue = this.farmer.location.dist_id;
            this.sectorValue = this.farmer.location.sect_id;
            this.cellValue = this.farmer.location.cell_id;
            this.villageValue = this.farmer.location.village_id;
          }
          (this.createForm.controls.requests as FormArray).push(this.createRequest());
          this.createForm.patchValue(temp);
          this.onChangeProvince(0);
        },
        () => {
          this.createFromPending = true;
          this.setError(['something went wrong!']);
        });
    } else {
      if (this.isUserDistrictCashCrop) {
        this.provinceValue = this.authenticationService.getCurrentUser().info.location.prov_id;
        this.districtValue = this.authenticationService.getCurrentUser().info.location.dist_id;
        this.locationService.getDistricts(this.authenticationService.getCurrentUser().info.location.prov_id).subscribe((districts) => {
          this.districts.push(districts);
        });
        this.locationService.getSectors(this.authenticationService.getCurrentUser().info.location.dist_id).subscribe((sectors) => {
          this.sectors.push(sectors);
        });
        (this.createForm.controls.requests as FormArray).push(this.createRequest());
      } else if (this.isUserSiteManager) {
        this.siteService.get(this.authenticationService.getCurrentUser().orgInfo.distributionSite).subscribe((site) => {
          this.site = site.content;
          this.provinceValue = this.site.location.prov_id._id;
          this.districtValue = this.site.location.dist_id._id;
          this.locationService.getDistricts(this.site.location.prov_id._id).subscribe((districts) => {
            this.districts.push(districts);
            (this.createForm.controls.requests as FormArray).push(this.createRequest());
          });
          const temp = [];
          this.site.coveredAreas.coveredSectors.map((sector) => {
            temp.push({
              _id: sector.sect_id,
              name: sector.name
            });
          });
          this.sectors.push(temp);
        });
      } else {
        (this.createForm.controls.requests as FormArray).push(this.createRequest());
      }
    }

    this.initial();
    this.setMessage(this.messageService.getMessage());
    this.onChangeType();
  }

  onSubmit() {
    if (this.createForm.valid) {
      if (this.createFromPending) {
        const temp = this.createForm.getRawValue();
        const farmer = {};
        farmer['fertilizer_need'.toString()] = temp.requests[0].fertilizer_need;
        farmer['fertilizer_allocate'.toString()] = temp.requests[0].fertilizer_allocate;
        farmer['location'.toString()] = temp.requests[0].location;
        farmer['numberOfTrees'.toString()] = temp.requests[0].numberOfTrees;
        farmer['_id'.toString()] = this.id;
        farmer['type'.toString()] = temp.type;
        farmer['phone_number'.toString()] = temp.phone_number;
        if (!this.isGroup) {
          farmer['surname'.toString()] = temp.surname;
          farmer['foreName'.toString()] = temp.foreName;
          farmer['sex'.toString()] = temp.sex;
          farmer['NID'.toString()] = temp.NID;
        } else {
          farmer['groupName'.toString()] = temp.groupName;
          farmer['groupContactPerson'.toString()] = temp.groupContactPerson;
        }
        this.helperService.cleanObject(farmer);
        if (this.isGroup) {
          this.farmerService.checkFarmerGroupName(temp.groupName).subscribe(data => {
            if (data.exists) {
              const message = 'Farmer with this group name ('
                + temp.groupName + ') already exists would you like to add land to the farmer?';
              this.confirmTempoAndSave(farmer, message);
            } else {
              this.farmerService.createFromPending(farmer).subscribe(() => {
                  this.messageService.setMessage('Record successful moved to approved list!');
                  this.router.navigateByUrl('admin/farmers/list');
                },
                (err) => {
                  this.setError(err.errors);
                });

            }
          });
        } else {
          this.farmerService.checkFarmerNID(temp.NID).subscribe(data => {
            if (data.exists) {
              const message = 'Farmer with this NID ('
                + temp.NID + ') already exists would you like to add land to the farmer?';
              this.confirmTempoAndSave(farmer, message);
            } else {
              this.farmerService.createFromPending(farmer).subscribe(() => {
                  this.messageService.setMessage('Record successful moved to approved list!');
                  this.router.navigateByUrl('admin/farmers/list');
                },
                (err) => {
                  this.setError(err.errors);
                });

            }
          });
        }
      } else {
        const temp = this.createForm.getRawValue();
        const farmer = {
          requestInfo: []
        };
        farmer['_id'.toString()] = this.id;
        farmer['type'.toString()] = temp.type;
        farmer['phone_number'.toString()] = temp.phone_number;
        if (!this.isGroup) {
          farmer['surname'.toString()] = temp.surname;
          farmer['foreName'.toString()] = temp.foreName;
          farmer['sex'.toString()] = temp.sex;
          farmer['NID'.toString()] = temp.NID;
        } else {
          farmer['groupName'.toString()] = temp.groupName;
          farmer['groupContactPerson'.toString()] = temp.groupContactPerson;
        }
        farmer['requestInfo'.toString()] = temp.requests;
        this.helperService.cleanObject(farmer);
        farmer.requestInfo.map((item) => {
          item['fertilizer_need'.toString()] =
            ((+item['numberOfTrees'.toString()]) * this.currentSeason.seasonParams.fertilizerKgPerTree);
          console.log(((+item['numberOfTrees'.toString()]) * this.currentSeason.seasonParams.fertilizerKgPerTree));
          return this.helperService.cleanObject(item);
        });
        if (this.isGroup) {
          this.farmerService.checkFarmerGroupName(temp.groupName).subscribe(data => {
            if (data.exists) {
              const message = 'Farmer with this group name ('
                + temp.groupName + ') already exists would you like to add land(s) to the farmer?';
              this.confirmFarmerAndSave(farmer, message);
            } else {

              this.farmerService.save(farmer).subscribe(() => {
                  this.messageService.setMessage('Farmer successfully created!');
                  this.router.navigateByUrl('admin/farmers/list');
                },
                (err) => {
                  this.setError(err.errors);
                });

            }
          });
        } else {
          this.farmerService.checkFarmerNID(temp.NID).subscribe(data => {
            if (data.exists) {
              const message = 'Farmer with this NID ('
                + temp.NID + ') already exists would you like to add land(s) to the farmer?';
              this.confirmFarmerAndSave(farmer, message);
            } else {
              this.farmerService.save(farmer).subscribe(() => {
                  this.messageService.setMessage('Farmer successfully created!');
                  this.router.navigateByUrl('admin/farmers/list');
                },
                (err) => {
                  if (isArray(err.errors)) {
                    this.setError(err.errors);
                  } else {
                    this.setError([err.errors]);
                  }
                });
            }
          });
        }
      }
    } else {
      if (this.helperService.getFormValidationErrors(this.createForm).length > 0) {
        this.setError(this.helperService.getFormValidationErrors(this.createForm));
      }
      if (this.createForm.get('requests').invalid) {
        this.setError('Missing required land(s) information');
      }
    }
  }

  confirmTempoAndSave(farmer: any, message: string) {
    this.confirmDialogService.openConfirmDialog(message).afterClosed().subscribe(
      res => {
        if (res) {
          this.farmerService.createFromPending(farmer).subscribe(() => {
              this.messageService.setMessage('Record successful moved to approved list!');
              this.router.navigateByUrl('admin/farmers/list');
            },
            (err) => {
              if (isArray(err.errors)) {
                this.setError(err.errors);
              } else {
                this.setError([err.errors]);
              }
              return;
            });

        }
      });
  }

  confirmFarmerAndSave(farmer: any, message: string) {
    this.confirmDialogService.openConfirmDialog(message).afterClosed().subscribe(
      res => {
        if (res) {
          this.farmerService.save(farmer).subscribe(() => {
              this.messageService.setMessage('Farmer successfully created!');
              this.router.navigateByUrl('admin/farmers/list');
            },
            (err) => {
              this.setError(err.errors);
            });
        }
      });
  }

  getLocationInput(i: number, field: string) {
    return this.getRequestsFormGroup(i).controls.location.get(field);
  }

  onInputNID(nid: string) {
    this.verifyNID(nid);
  }

  verifyNID(nid: string) {
    if (nid.length >= 16) {
      this.clear();
      this.loading = true;
      this.userService.verifyNID(nid).subscribe(data => {
          const info = {
            foreName: data.content.foreName,
            surname: data.content.surname,
            sex: data.content.sex.toLowerCase()
          };
          this.createForm.patchValue(info);
          this.submit = true;
          this.clear();
          this.loading = false;
          this.invalidId = false;
        },
        () => {
          this.submit = false;
          this.loading = false;
          if (!this.isGroup) {
            this.invalidId = true;
          }
        });
    } else {
      this.submit = false;
    }
  }

  resetNIDInfo() {
    this.createForm.get('foreName'.toString()).reset();
    this.createForm.get('surname'.toString()).reset();
    this.createForm.get('sex'.toString()).reset();
  }

  createRequest(): FormGroup {
    return this.formBuilder.group({
      numberOfTrees: ['', [Validators.required,
        Validators.min(1), Validators.pattern('[0-9]*')]],
      fertilizer_need: [''],
      fertilizer_allocate: [0],
      location: this.formBuilder.group({
        prov_id: [{value: this.provinceValue, disabled: this.disableProvId}, Validators.required],
        dist_id: [{value: this.districtValue, disabled: this.disableDistId}, Validators.required],
        sect_id: [this.sectorValue, Validators.required],
        cell_id: [this.cellValue, Validators.required],
        village_id: [this.villageValue, Validators.required]
      })
    });
  }

  get formRequests() {
    return this.createForm.get('requests') as FormArray;
  }

  onCancel() {
    this.location.back();
  }

  addRequest() {
    (this.createForm.controls.requests as FormArray).push(this.createRequest());
    this.provinces.push(this.provinces[0]);
    if (this.disableDistId) {
      this.districts.push(this.districts[0]);
    }
  }

  removeRequest(index: number) {
    (this.createForm.controls.requests as FormArray).removeAt(index);
  }

  getRequestsFormGroup(index): FormGroup {
    this.requestList = this.createForm.get('requests') as FormArray;
    return this.requestList.controls[index] as FormGroup;
  }

  onChangeType() {
    this.createForm.get('type'.toString()).valueChanges.subscribe(
      (value) => {
        if (+value === 2) {
          this.isGroup = true;
          this.submit = true;
          this.loading = false;
        } else {
          this.isGroup = false;
        }
      }
    );
  }

  onChangeProvince(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get('prov_id'.toString()).value;
    if (value !== '') {
      this.locationService.getDistricts(value).toPromise().then(data => {
        this.districts[index] = data;
        this.sectors[index] = [];
        this.cells[index] = [];
        this.villages[index] = [];
        if (this.createFromPending) {
          this.getLocationInput(index, 'dist_id').setValue(this.farmer.location.dist_id);
          this.onChangeDistrict(0);
        }
      });
    }
  }

  onChangeDistrict(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get('dist_id'.toString()).value;
    if (value !== '') {
      if (this.isUserSiteManager) {
        const temp = [];
        this.site.coveredAreas.coveredSectors.map((sector) => {
          temp.push({
            _id: sector.sect_id,
            name: sector.name
          });
        });
        this.sectors[index] = temp;
      } else {
        this.locationService.getSectors(value).toPromise().then(data => {
          this.sectors[index] = data;
          this.cells[index] = [];
          this.villages[index] = [];
        });
      }
      if (this.createFromPending) {
        this.getLocationInput(index, 'sect_id').setValue(this.farmer.location.sect_id);
        this.onChangeSector(0);
      }
    }
  }

  onChangeSector(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get('sect_id'.toString()).value;
    if (value !== '') {
      this.locationService.getCells(value).toPromise().then(data => {
        this.cells[index] = data;
        this.villages[index] = [];
        if (this.createFromPending) {
          this.getLocationInput(index, 'cell_id').setValue(this.farmer.location.cell_id);
          this.onChangeCell(0);
        }
      });
    }
  }

  onChangeCell(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get('cell_id'.toString()).value;
    if (value !== '') {
      this.locationService.getVillages(value).toPromise().then(data => {
        this.villages[index] = data;
        if (this.createFromPending) {
          this.getLocationInput(index, 'village_id').setValue(this.farmer.location.village_id);
        }
      });
    }
  }

  initial() {
    this.locationService.getProvinces().toPromise().then(data => {
      this.provinces.push(data);
    });
  }

  ngOnDestroy() {
  }
}
