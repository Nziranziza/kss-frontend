import {Component, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {
  AuthenticationService,
  AuthorisationService,
  BasicComponent,
  ConfirmDialogService,
  FarmerService,
  FarmService,
  HelperService,
  LocationService,
  MessageService,
  OrganisationService,
  SiteService,
  UserService,
} from '../../../core';
import {isArray, isUndefined} from 'util';
import {Location} from '@angular/common';

@Component({
  selector: 'app-farmer-create',
  templateUrl: './farmer-create.component.html',
  styleUrls: ['./farmer-create.component.css'],
})
export class FarmerCreateComponent
  extends BasicComponent
  implements OnInit, OnDestroy {
  createForm: UntypedFormGroup;
  treesProvinces: any;
  treesDistricts: any;
  treesSectors: any;
  treesCells: any;
  treesVillages: any;
  addressProvinces: any;
  addressDistricts: any;
  addressSectors: any;
  addressCells: any;
  addressVillages: any;
  requestIndex = 0;
  farmer: any;
  createFromPending = false;
  isGroup = false;
  id: string;
  submit = false;
  loading = false;
  farmerTypes = [1, 2];
  invalidId = false;
  currentSeason: any;
  isUserCWSOfficer = false;
  isUserDistrictCashCrop = false;
  isUserSiteManager = false;
  user: any;
  site: any;
  org: any;
  disableProvId = false;
  disableDistId = false;
  provinceValue = '';
  districtValue = '';
  validForm = true;
  checkIfUpiInValidZoning = {
    prov_id: true,
    dist_id: true,
    sect_id: true,
    cell_id: true,
    village_id: true
  };
  save = false;
  paymentChannels: any;
  channels: any;
  treeVarieties: any;
  ranges = ['0-3', '4-10', '11-15', '16-20', '21-25', '26-30', '31+'];
  certificates: any;
  certificateNames = [{
    name: 'Organic',
  }, {
    name: 'Fair Trade',
  }, {
    name: 'Rain Forest',
  }, {
    name: 'UTZ',
  }, {
    name: 'C.A.F.E Practice',
  }, {
    name: '4C',
  }, {
    name: 'Appellation',
  }];
  upi: any;
  land: any;
  province: any;
  district: any;
  sector: any;
  cell: any;
  village: any;

  public requestList: UntypedFormArray;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private farmerService: FarmerService,
    private userService: UserService,
    private organisationService: OrganisationService,
    private locationService: LocationService,
    private siteService: SiteService,
    private confirmDialogService: ConfirmDialogService,
    private authenticationService: AuthenticationService,
    private authorisationService: AuthorisationService,
    private messageService: MessageService,
    private helperService: HelperService,
    private location: Location,
    private farmService: FarmService
  ) {
    super();
  }

  get formTreeAges() {
    return this.createForm.get('treeAges') as UntypedFormArray;
  }

  get formCertificates() {
    return this.createForm.get('certificates') as UntypedFormArray;
  }

  get formPaymentChannel() {
    return this.createForm.controls.paymentChannels as UntypedFormArray;
  }

  ngOnInit() {
    this.currentSeason = this.authenticationService.getCurrentSeason();
    this.isUserCWSOfficer = this.authorisationService.isCWSUser();
    this.isUserDistrictCashCrop =
      this.authorisationService.isDistrictCashCropOfficer();
    this.isUserSiteManager = this.authorisationService.isSiteManager();
    this.user = this.authenticationService.getCurrentUser();
    if (
      this.isUserSiteManager ||
      this.isUserDistrictCashCrop ||
      this.isUserCWSOfficer
    ) {
      this.disableDistId = true;
      this.disableProvId = true;
    }
    this.createForm = this.formBuilder.group({
      foreName: [''],
      surname: [''],
      groupName: [''],
      phone_number: ['', Validators.pattern('[0-9]{12}')],
      sex: [''],
      NID: [''],
      type: [this.farmerTypes[0], Validators.required],
      groupContactPerson: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        phone: ['', Validators.pattern('[0-9]{12}')],
      }),
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
      familySize: [''],
      fertilizer_allocate: [0],
      tree_location: this.formBuilder.group({
        prov_id: [
          {value: '', disabled: this.disableProvId}, Validators.required
        ],
        dist_id: [
          {value: '', disabled: this.disableDistId}, Validators.required
        ],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
      location_if_upi: this.formBuilder.group({
        prov_id: [{value: '', disabled: true}],
        dist_id: [{value: '', disabled: true}],
        sect_id: [{value: '', disabled: true}],
        cell_id: [{value: '', disabled: true}],
        village_id: [{value: '', disabled: true}],
      }),
      upiNumber: [''],
      landOwner: [''],
      longitudeCoordinate: [''],
      latitudeCoordinate: [''],
      active: [''],
      treeAges: new UntypedFormArray([]),
      certificates: new UntypedFormArray([]),
      numberOfTrees: ['', [Validators.required, Validators.pattern('[0-9]*')]],
    });

    this.farmService.listTreeVarieties().subscribe((data) => {
      this.treeVarieties = data.data;
      this.createAgeRanges();
    });
    this.route.params.subscribe((params) => {
      if (params.id !== undefined) {
        this.createFromPending = true;
        this.id = params.id;
      }
    });
    this.locationService.getProvinces().subscribe((data) => {
      this.addressProvinces = data;
    });
    if (this.authenticationService.getCurrentUser().orgInfo.distributionSite) {
      this.siteService
        .get(
          this.authenticationService.getCurrentUser().orgInfo.distributionSite
        )
        .subscribe((site) => {
          this.site = site.content;
        });
    }
    this.organisationService
      .get(this.authenticationService.getCurrentUser().info.org_id)
      .subscribe((data) => {
        this.org = data.content;
      });
    if (this.isUserCWSOfficer) {
      this.organisationService
        .get(this.authenticationService.getCurrentUser().info.org_id)
        .subscribe((data) => {
          this.provinceValue = data.content.location.prov_id._id;
          this.districtValue = data.content.location.dist_id._id;
          this.setDisabledLocation();
          this.locationService
            .getDistricts(data.content.location.prov_id._id)
            .subscribe((districts) => {
              this.treesDistricts = districts;
            });
          const temp = [];
          data.content.coveredSectors.map((sector) => {
            temp.push({
              _id: sector.sectorId._id,
              name: sector.sectorId.name,
            });
          });
          this.treesSectors = temp;
        });
    } else if (this.isUserDistrictCashCrop) {
      this.provinceValue =
        this.authenticationService.getCurrentUser().info.location.prov_id;
      this.districtValue =
        this.authenticationService.getCurrentUser().info.location.dist_id;
      this.setDisabledLocation();
      this.locationService
        .getDistricts(
          this.authenticationService.getCurrentUser().info.location.prov_id
        )
        .subscribe((districts) => {
          this.treesDistricts = districts;
        });
      this.locationService
        .getSectors(
          this.authenticationService.getCurrentUser().info.location.dist_id
        )
        .subscribe((sectors) => {
          this.treesSectors = sectors;
        })
    } else if (this.isUserSiteManager && !this.isUserCWSOfficer) {
      this.siteService
        .get(
          this.authenticationService.getCurrentUser().orgInfo.distributionSite
        )
        .subscribe((site) => {
          this.site = site.content;
          this.provinceValue = this.site.location.prov_id._id;
          this.districtValue = this.site.location.dist_id._id;
          this.setDisabledLocation();
          this.locationService
            .getDistricts(this.site.location.prov_id._id)
            .subscribe((districts) => {
              this.treesDistricts = districts;
            });
          const temp = [];
          this.site.coveredAreas.coveredSectors.map((sector) => {
            temp.push({
              _id: sector.sect_id,
              name: sector.name,
            });
          });
          this.treesSectors = temp;
        });
    }

    this.initial();
    this.getPaymentChannels();
    /* this.addPaymentChannel(); */
    this.setMessage(this.messageService.getMessage());
    this.onChangeType();
    this.onChanges();
  }

  validateUPI(event) {
    const upi = event.target.value
    if (upi.length > 0) {
      this.createForm.controls.upiNumber.setErrors({invalid: true});
    }
    this.checkIfUpiInValidZoning = {
      prov_id: true,
      dist_id: true,
      sect_id: true,
      cell_id: true,
      village_id: true
    };

    if (upi.length >= 15) {
      const body = {
        upiNumber: upi,
      };
      this.farmService.validateUPI(body).subscribe(
        (data) => {
          this.upi = data.data;
          // Reset Validators
          this.createForm.controls.upiNumber.setErrors(null);

          const payload = {
            province: this.upi.parcelLocation.province.provinceName.toUpperCase(),
            district: this.titleCase(this.upi.parcelLocation.district.districtName),
            sector: this.titleCase(this.upi.parcelLocation.sector.sectorName),
            cell: this.titleCase(this.upi.parcelLocation.cell.cellName),
            village: this.titleCase(this.upi.parcelLocation.village.villageName),
          }

          this.locationService.getZoningIDS(payload).subscribe(
            (pr) => {
              this.province = pr;
            },
            () => {
            },
            () => {
              const villagesSet = [];
              this.org.coveredSectors.map((sector) => {
                sector.coveredVillages.map((village) => {
                  villagesSet.push(village.village_id);
                });
              });

              if (this.province.province_id !== this.org.location.prov_id._id) {
                this.checkIfUpiInValidZoning.prov_id = false
                this.createForm.controls.upiNumber.setErrors({Invalid: true});
              } else if (this.province.district_id !== this.org.location.dist_id._id) {
                this.checkIfUpiInValidZoning.dist_id = false
                this.createForm.controls.upiNumber.setErrors({Invalid: true});
              } else if (!villagesSet.includes(this.province.village_id)) { // If yes, use location.
                this.checkIfUpiInValidZoning.village_id = false
                this.createForm.controls.upiNumber.setErrors({Invalid: true});
              } else {

                this.treesProvinces = [{
                  _id: this.province.province_id,
                  namee: this.titleCase(this.upi.parcelLocation.province.provinceName)
                }];
                this.treesDistricts = [{
                  _id: this.province.district_id,
                  name: this.titleCase(this.upi.parcelLocation.district.districtName)
                }];
                this.treesSectors = [{
                  _id: this.province.sector_id,
                  name: this.titleCase(this.upi.parcelLocation.sector.sectorName)
                }];
                this.treesCells = [{
                  _id: this.province.cell_id,
                  name: this.titleCase(this.upi.parcelLocation.cell.cellName)
                }];
                this.treesVillages = [{
                  _id: this.province.village_id,
                  name: this.titleCase(this.upi.parcelLocation.village.villageName)
                }];
                this.createForm.controls.location_if_upi.get('prov_id').setValue(this.province.province_id);
                this.createForm.controls.location_if_upi.get('dist_id').setValue(this.province.district_id);
                this.createForm.controls.location_if_upi.get('sect_id').setValue(this.province.sector_id);
                this.createForm.controls.location_if_upi.get('cell_id').setValue(this.province.cell_id);
                this.createForm.controls.location_if_upi.get('village_id').setValue(this.province.village_id);
              }
            }
          );

          this.createForm.controls.landOwner.setValue(
            this.upi.representative.surname +
            ' ' +
            this.upi.representative.foreNames
          );

          if (!Object.keys(this.upi).length) {
            this.setError(['UPI not found']);
          }
        },
        () => {
          this.createForm.controls.landOwner.reset();
          this.setError(['UPI not found']);
        }
      );
    }
  }

  titleCase(word: string) {
    return word[0].toUpperCase() + word.substr(1).toLowerCase();
  }

  getTreeLocationInput(field: string) {
    return this.createForm.controls.tree_location.get(field);
  }

  formTreeVarieties(i: number) {
    return this.formTreeAges.at(i).get('varieties') as UntypedFormArray;
  }

  addTreeVariety(i: number) {
    this.formTreeVarieties(i).push(
      this.formBuilder.group({
        selected: [false],
        number: [0],
        varietyId: [''],
      })
    );
  }

  createAgeRanges() {
    this.ranges.forEach((range, i) => {
      this.formTreeAges.push(
        this.formBuilder.group({
          range,
          numOfTrees: [0],
          varieties: new UntypedFormArray([]),
        })
      );
      this.treeVarieties.forEach((variety, t) => {
        this.formTreeVarieties(i).push(
          this.formBuilder.group({
            selected: [false],
            number: [0],
            varietyId: [variety._id],
          })
        );
      });
    });
  }

  createCertificate(): UntypedFormGroup {
    return this.formBuilder.group({
      name: [''],
      identificationNumber: [''],
    });
  }

  addCertificate() {
    (this.createForm.controls.certificates as UntypedFormArray).push(
      this.createCertificate()
    );
  }

  removeCertificate(index: number) {
    (this.createForm.controls.certificates as UntypedFormArray).removeAt(index);
  }

  getCertificateFormGroup(index): UntypedFormGroup {
    this.certificates = this.createForm.get('certificates') as UntypedFormArray;
    return this.certificates.controls[index] as UntypedFormGroup;
  }

  updateList(i: number, v: number) {
    const value = this.createForm.controls.treeAges.value;
    const sum = value[i].varieties
      .map((item) => item.number)
      .reduce((prev, curr) => prev + curr, 0);
    this.formTreeAges
      .at(i)
      .get('numOfTrees')
      .setValue(sum, {emitEvent: true});
    if (this.formTreeVarieties(i).at(v).get('number').value !== 0) {
      this.formTreeVarieties(i).at(v).get('selected').setValue(true);
    } else {
      this.formTreeVarieties(i).at(v).get('selected').setValue(false);
    }
  }

  onSubmit() {
    this.createForm.markAllAsTouched();
    if (this.createForm.controls.upiNumber.value) {
      this.createForm.controls.tree_location.get('prov_id').clearValidators();
      this.createForm.controls.tree_location.get('prov_id').updateValueAndValidity();
      this.createForm.controls.tree_location.get('dist_id').clearValidators();
      this.createForm.controls.tree_location.get('dist_id').updateValueAndValidity();
      this.createForm.controls.tree_location.get('sect_id').clearValidators();
      this.createForm.controls.tree_location.get('sect_id').updateValueAndValidity();
      this.createForm.controls.tree_location.get('cell_id').clearValidators();
      this.createForm.controls.tree_location.get('cell_id').updateValueAndValidity();
      this.createForm.controls.tree_location.get('village_id').clearValidators();
      this.createForm.controls.tree_location.get('village_id').updateValueAndValidity();
    }

    if (this.createForm.valid) {
      this.loading = true;
      const temp = this.createForm.getRawValue();
      const farmer = {
        requestInfo: [],
      };
      farmer['type'.toString()] = temp.type;
      farmer['phone_number'.toString()] = temp.phone_number;
      temp.treeAges.map((item) => {
        item.varieties.map((variety) => {
          delete variety.selected;
          return variety;
        });
      });
      farmer['created_by'.toString()] =
        this.authenticationService.getCurrentUser().info._id;
      if (!this.isGroup) {
        farmer['surname'.toString()] = temp.surname;
        farmer['foreName'.toString()] = temp.foreName;
        farmer['sex'.toString()] = temp.sex;
        farmer['NID'.toString()] = temp.NID;
        farmer['location'.toString()] = temp.location;
        farmer['familySize'.toString()] = temp.familySize;
      } else {
        farmer['groupName'.toString()] = temp.groupName;
        farmer['groupContactPerson'.toString()] = temp.groupContactPerson;
      }

      farmer['requestInfo'.toString()] = [
        {
          fertilizer_need: temp.numberOfTrees *
            this.currentSeason.seasonParams.fertilizerKgPerTree,
          fertilizer_allocate: 0,
          landOwner: temp.landOwner,
          upiNumber: temp.upiNumber,
          treeAges: temp.treeAges,
          numberOfTrees: temp.numberOfTrees,
          location: this.createForm.controls.upiNumber.value ? temp.location_if_upi : temp.tree_location,
          ...(temp.certificates.length > 0 && {certificates: temp.certificates})
        }
      ];

      this.helperService.cleanObject(farmer);
      if (this.isGroup) {
        this.farmerService
          .checkFarmerGroupName(temp.groupName)
          .subscribe((data) => {
            if (data.exists) {
              const message =
                'Farmer with this group name (' +
                temp.groupName +
                ') already exists would you like to add land(s) to the farmer?';
              this.confirmFarmerAndSave(farmer, message);
            } else {
              this.farmerService.save(farmer).subscribe(
                () => {
                  this.loading = false;
                  this.messageService.setMessage(
                    'Farmer successfully created!'
                  );
                  this.router.navigateByUrl('admin/farmers/list');
                },
                (err) => {
                  this.loading = false;
                  this.setError(err.errors);
                }
              );
            }
          });
      } else {
        this.farmerService.checkFarmerNID(temp.NID).subscribe((data) => {
          if (data.exists) {
            const message =
              'Farmer with this NID (' +
              temp.NID +
              ') already exists would you like to add land(s) to the farmer?';
            this.confirmFarmerAndSave(farmer, message);
          } else {
            this.farmerService.save(farmer).subscribe(
              () => {
                this.loading = false;
                this.messageService.setMessage(
                  'Farmer successfully created!'
                );
                this.location.back();
              },
              (err) => {
                this.loading = false;
                if (isArray(err.errors)) {
                  this.setError(err.errors);
                } else {
                  this.setError([err.errors]);
                }
              }
            );
          }
        });
      }
    } else {
      if (
        this.helperService.getFormValidationErrors(this.createForm).length > 0
      ) {
        this.loading = false;
        this.setError(
          this.helperService.getFormValidationErrors(this.createForm)
        );
      }
      this.loading = false;
      if (this.createForm.get('requests').invalid) {
        this.setError('Missing required land(s) information');
      }
    }
  }

  confirmFarmerAndSave(farmer: any, message: string) {
    this.confirmDialogService
      .openConfirmDialog(message)
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.farmerService.save(farmer).subscribe(
            () => {
              this.messageService.setMessage('Farmer successfully created!');
              this.router.navigateByUrl('admin/farmers/list');
            },
            (err) => {
              this.setError(err.errors);
            }
          );
        }
      });
  }

  onInputNID(nid: string) {
    this.verifyNID(nid);
  }

  verifyNID(nid: string) {
    if (nid.length >= 16) {
      this.clear();
      this.loading = true;
      this.userService.verifyNID(nid).subscribe(
        (data) => {
          const info = {
            foreName: data.content.foreName,
            surname: data.content.surname,
            sex: data.content.sex.toLowerCase(),
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
        }
      );
    } else {
      this.submit = false;
      this.resetNIDInfo();
    }
  }

  resetNIDInfo() {
    this.createForm.get('foreName'.toString()).reset();
    this.createForm.get('surname'.toString()).reset();
    this.createForm.get('sex'.toString()).reset();
  }

  onCancel() {
    this.location.back();
  }

  onChangeType() {
    this.createForm.get('type'.toString()).valueChanges.subscribe((value) => {
      if (+value === 2) {
        this.isGroup = true;
        this.submit = true;
        this.loading = false;
      } else {
        this.isGroup = false;
      }
    });
  }


  validateNumbers(value: any) {
    const numberOfTrees = this.createForm.controls.numberOfTrees.value;
    const sumAllNumOfTrees = value
      .map((item) => item.numOfTrees)
      .reduce((prev, curr) => prev + curr, 0);
    const found = value.findIndex((range) => {
      const sumAllNumber = range.varieties
        .map((item) => item.number)
        .reduce((prev, curr) => prev + curr, 0);
      return range.numOfTrees !== sumAllNumber;
    });
    return !(found !== -1 || numberOfTrees !== sumAllNumOfTrees);
  }

  onChanges() {
    this.createForm.controls.location
      .get('prov_id'.toString())
      .valueChanges.subscribe((value) => {
      console.log(value);
      if (value !== '') {
        this.locationService.getDistricts(value).subscribe((data) => {
          console.log(data);
          this.addressDistricts = data;
          this.addressSectors = null;
          this.addressCells = null;
          this.addressVillages = null;
        });
      }
    });
    this.createForm.controls.location
      .get('dist_id'.toString())
      .valueChanges.subscribe((value) => {
      if (value !== '') {
        this.locationService.getSectors(value).subscribe((data) => {
          this.addressSectors = data;
          this.addressCells = null;
          this.addressVillages = null;
        });
      }
    });
    this.createForm.controls.location
      .get('sect_id'.toString())
      .valueChanges.subscribe((value) => {
      if (value !== '') {
        this.locationService.getCells(value).subscribe((data) => {
          this.addressCells = data;
          this.addressVillages = null;
        });
      }
    });
    this.createForm.controls.location
      .get('cell_id'.toString())
      .valueChanges.subscribe((value) => {
      if (value !== '') {
        this.locationService.getVillages(value).subscribe((data) => {
          this.addressVillages = data;
        });
      }
    });
    this.createForm.controls.treeAges.valueChanges.subscribe((value) => {
      if (value !== null) {
        this.validForm = this.validateNumbers(value);
        this.save = this.validForm;
      }
    });
    this.createForm.controls.numberOfTrees.valueChanges.subscribe((value) => {
      if (value !== null) {
        this.validForm = this.validateNumbers(
          this.createForm.controls.treeAges.value
        );
        this.save = this.validForm;
      }
    });
    this.createForm.controls.phone_number.valueChanges.subscribe((value) => {
      if (value === '07') {
        this.createForm.controls.phone_number.setValue('2507');
      }
    });
    this.createForm.controls.groupContactPerson.get('phone').valueChanges.subscribe((value) => {
      if (value === '07') {
        this.createForm.controls.phone_number.setValue('2507');
      }
    });
    this.createForm.controls.tree_location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.treesDistricts = data;
            this.treesSectors = null;
            this.treesCells = null;
            this.treesVillages = null;
          });
        }
      }
    );
    this.createForm.controls.tree_location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          if (this.isUserSiteManager && (!this.isUserCWSOfficer)) {
            const temp = [];
            this.site.coveredAreas.coveredSectors.map((sector) => {
              temp.push({
                _id: sector.sect_id,
                name: sector.name
              });
            });
            this.treesSectors.push(temp);
          } else if (this.isUserCWSOfficer) {
            this.filterCustomSectors(this.org);
          } else {
            this.locationService.getSectors(value).toPromise().then(data => {
              this.treesSectors = data;
            });
          }
          this.treesCells = [];
          this.treesVillages = [];
        }
      }
    );
    this.createForm.controls.tree_location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          if (this.isUserCWSOfficer) {
            this.filterCustomCells(this.org);
          } else {
            this.locationService.getCells(value).subscribe((data) => {
              this.treesCells = data;
            });
          }
          this.treesVillages = null;
        }
      }
    );
    this.createForm.controls.tree_location.get('cell_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          this.locationService.getVillages(value).subscribe((data) => {
            if (this.isUserCWSOfficer) {
              this.filterCustomVillages(this.org, data);
            } else {
              this.treesVillages = data;
            }
          });
        }
      }
    );
  }

  onChangePaymentChannel(index: number) {
    const value = this.formPaymentChannel.value[index];
    this.formPaymentChannel.value.forEach((el, i) => {
      if (
        value.inputName === el.inputName &&
        this.formPaymentChannel.value.length > 1 &&
        i !== index
      ) {
        this.removePaymentChannel(index);
      }
    });
  }

  addPaymentChannel() {
    (this.createForm.controls.paymentChannels as UntypedFormArray).push(
      this.createPaymentChannel()
    );
  }

  getPaymentChannelFormGroup(index): UntypedFormGroup {
    this.paymentChannels = this.createForm.controls
      .paymentChannels as UntypedFormArray;
    return this.paymentChannels.controls[index] as UntypedFormGroup;
  }

  removePaymentChannel(index: number) {
    (this.createForm.controls.paymentChannels as UntypedFormArray).removeAt(index);
  }

  createPaymentChannel(): UntypedFormGroup {
    return this.formBuilder.group({
      channelId: ['', Validators.required],
      account: ['', Validators.required],
    });
  }

  filterCustomSectors(org: any) {
    const temp = [];
    org.coveredSectors.map((sector) => {
      temp.push({
        _id: sector.sectorId._id,
        name: sector.sectorId.name
      });
    });
    this.treesSectors = temp;
  }

  filterCustomCells(org: any) {
    const temp = [];
    const sectorId = this.createForm.controls.tree_location.get('sect_id'.toString()).value;
    const i = org.coveredSectors.findIndex(element => element.sectorId._id === sectorId);
    const sector = org.coveredSectors[i];
    sector.coveredCells.map((cell) => {
      temp.push({
        _id: cell.cell_id,
        name: cell.name
      });
    });
    this.treesCells = temp;
  }

  filterCustomVillages(org: any, villages: any) {
    const temp = [];
    const sectorId = this.createForm.controls.tree_location.get('sect_id'.toString()).value;
    const i = org.coveredSectors.findIndex(element => element.sectorId._id === sectorId);
    const sector = org.coveredSectors[i];
    sector.coveredVillages.map((village) => {
      if (villages.findIndex(el => el._id === village.village_id) !== -1) {
        temp.push({
          _id: village.village_id,
          name: village.name
        });
      }
    });
    this.treesVillages = temp;
  }

  getPaymentChannels() {
    this.channels = [
      {
        name: 'MTN',
        _id: '5d1635ac60c3dd116164d4ae',
      },
      {
        name: 'IKOFI',
        _id: '5d1635ac60c3dd116164d4ac',
      },
    ];
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.addressProvinces = data;
      this.treesProvinces = data;
      this.setDisabledLocation();
    });
  }

  setDisabledLocation() {
    this.createForm.controls.tree_location
      .get('prov_id'.toString())
      .patchValue(this.provinceValue, {emitEvent: false});
    this.createForm.controls.tree_location
      .get('dist_id'.toString())
      .patchValue(this.districtValue, {emitEvent: false});
  }

  ngOnDestroy() {
  }
}
