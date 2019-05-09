import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {FarmerService, OrganisationService} from '../../core/services';
import {LocationService} from '../../core/services/location.service';

@Component({
  selector: 'app-farmer-edit-profile',
  templateUrl: './farmer-edit-profile.component.html',
  styleUrls: ['./farmer-edit-profile.component.css']
})
export class FarmerEditProfileComponent implements OnInit {

  editForm: FormGroup;
  errors: string[];
  provinces = [];
  districts = [];
  sectors = [];
  cells = [];
  villages = [];
  requestIndex = 0;
  farmer: any;
  public requestList: FormArray;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private farmerService: FarmerService,
              private organisationService: OrganisationService,
              private locationService: LocationService) {
  }

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      foreName: [''],
      surname: [''],
      email: [''],
      phone_number: [''],
      sex: [''],
      NID: [''],
      individualOrGroup: [''],
      requests: new FormArray([])
    });
    this.initial();
    this.route.params.subscribe(params => {
      this.farmerService.get(params['id'.toString()]).subscribe(data => {
        this.farmer = data.content;
      });
    });
    this.editForm.patchValue(this.farmer);
  }

  onSubmit() {
    if (this.editForm.valid) {
    }
  }

  createRequest(): FormGroup {
    return this.formBuilder.group({
      season: ['19B'],
      numberOfTrees: [''],
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: ['']
      }),
    });
  }

  get formRequests() { return this.editForm.get('requests') as FormArray; }

  addRequest() {
    (this.editForm.controls.requests as FormArray).push(this.createRequest());
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces.push(data);
    });
  }

  removeRequest(index: number) {
    (this.editForm.controls.requests as FormArray).removeAt(index);
  }

  getRequestsFormGroup(index): FormGroup {
    this.requestList = this.editForm.get('requests') as FormArray;
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

}
