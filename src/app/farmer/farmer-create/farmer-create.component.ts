import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {FarmerService, OrganisationService} from '../../core/services';
import {LocationService} from '../../core/services/location.service';

@Component({
  selector: 'app-farmer-create',
  templateUrl: './farmer-create.component.html',
  styleUrls: ['./farmer-create.component.css']
})
export class FarmerCreateComponent implements OnInit {

  createForm: FormGroup;
  errors: string[];
  provinces = [];
  districts = [];
  sectors = [];
  cells = [];
  villages = [];
  requestIndex = 0;
  public requestList: FormArray;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private farmerService: FarmerService,
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
      individualOrGroup: [''],
      requests: new FormArray([])
    });

    (this.createForm.controls.requests as FormArray).push(this.createRequest());
    this.initial();
  }

  onSubmit() {
    if (this.createForm.valid) {
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

  addRequest() {
    (this.createForm.controls.requests as FormArray).push(this.createRequest());
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces.push(data);
    });
  }

  removeRequest(index: number) {
    (this.createForm.controls.requests as FormArray).removeAt(index);
  }

  getRequestsFormGroup(index): FormGroup {
    this.requestList = this.createForm.get('requests') as FormArray;
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
