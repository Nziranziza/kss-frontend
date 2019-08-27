import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HelperService} from '../../../core/helpers';
import {AuthenticationService, FarmerService} from '../../../core/services';
import {isPlatformBrowser} from '@angular/common';
import {LocationService} from '../../../core/services';
import {MessageService} from '../../../core/services';
import {Router} from '@angular/router';

@Component({
  selector: 'app-add-farmer-request',
  templateUrl: './add-farmer-request.component.html',
  styleUrls: ['./add-farmer-request.component.css']
})
export class AddFarmerRequestComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() farmerId;
  addFarmerRequestForm: FormGroup;
  errors = [];
  provinces = [];
  districts = [];
  sectors = [];
  cells = [];
  villages = [];
  requestIndex = 0;
  message: string;

  public requestList: FormArray;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object, private  router: Router,
    private injector: Injector, private formBuilder: FormBuilder, private authenticationService: AuthenticationService,
    private helper: HelperService, private farmerService: FarmerService, private messageService: MessageService,
    private locationService: LocationService) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.addFarmerRequestForm = this.formBuilder.group({
      requests: new FormArray([])
    });
    this.initial();
    (this.addFarmerRequestForm.controls.requests as FormArray).push(this.createRequest());
  }

  getLocationInput(i: number, field: string) {
    return this.getRequestsFormGroup(i).controls.location.get(field);
  }

  createRequest(): FormGroup {
    return this.formBuilder.group({
      numberOfTrees: ['', [Validators.required,
        Validators.min(1), Validators.pattern('[0-9]*')]],
      fertilizer_need: [''],
      fertilizer_allocate: [0],
      location: this.formBuilder.group({
        prov_id: ['', Validators.required],
        dist_id: ['', Validators.required],
        sect_id: ['', Validators.required],
        cell_id: ['', Validators.required],
        village_id: ['', Validators.required]
      })
    });
  }

  get formRequests() {
    return this.addFarmerRequestForm.get('requests') as FormArray;
  }

  addRequest() {
    (this.addFarmerRequestForm.controls.requests as FormArray).push(this.createRequest());
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces.push(data);
    });
  }

  removeRequest(index: number) {
    (this.addFarmerRequestForm.controls.requests as FormArray).removeAt(index);
  }

  getRequestsFormGroup(index): FormGroup {
    this.requestList = this.addFarmerRequestForm.get('requests') as FormArray;
    return this.requestList.controls[index] as FormGroup;
  }

  onChangeProvince(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get('prov_id'.toString()).value;
    if (value !== '') {
      this.locationService.getDistricts(value).subscribe((data) => {
        this.districts[index] = data;
        this.sectors[index] = [];
        this.cells[index] = [];
        this.villages[index] = [];
      });
    }
  }

  onChangeDistrict(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get('dist_id'.toString()).value;
    if (value !== '') {
      this.locationService.getSectors(value).subscribe((data) => {
        this.sectors[index] = data;
        this.cells[index] = [];
        this.villages[index] = [];
      });
    }
  }

  onChangeSector(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get('sect_id'.toString()).value;
    if (value !== '') {
      this.locationService.getCells(value).subscribe((data) => {
        this.cells[index] = data;
        this.villages[index] = [];
      });
    }
  }

  onChangeCell(index: number) {
    const value = this.getRequestsFormGroup(index).controls.location.get('cell_id'.toString()).value;
    if (value !== '') {
      this.locationService.getVillages(value).subscribe((data) => {
        this.villages[index] = data;
      });
    }
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces.push(data);
    });
  }

  onSubmit() {
    if (this.addFarmerRequestForm.valid) {
      const temp = this.addFarmerRequestForm.value;
      const farmer = {
        requestInfo: []
      };
      farmer['requestInfo'.toString()] = temp.requests;
      this.helper.cleanObject(farmer);
      farmer.requestInfo.map((item) => {
        item['fertilizer_need'.toString()] = +item['numberOfTrees'.toString()];
        return this.helper.cleanObject(item);
      });
      farmer['id'.toString()] = this.farmerId;
      this.farmerService.addFarmerRequest(farmer).subscribe((data) => {
          this.messageService.setMessage('request successfully added!');
          this.modal.dismiss();
        },
        (err) => {
          console.log(err.errors);
          this.errors = err.errors;
        });

    } else {
      if (this.helper.getFormValidationErrors(this.addFarmerRequestForm).length > 0) {
        this.errors = this.helper.getFormValidationErrors(this.addFarmerRequestForm);
      }
      if (this.addFarmerRequestForm.get('requests').invalid) {
        this.errors.push('Missing required land(s) information');
      }
    }
  }
}
