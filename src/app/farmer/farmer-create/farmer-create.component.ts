import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {FarmerService, OrganisationService} from '../../core/services';
import {LocationService} from '../../core/services/location.service';
import {UserService} from '../../core/services/user.service';
import {MessageService} from '../../core/services/message.service';

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
  userNIDInfo = {};
  farmer: any;
  createFromPending = false;
  id: string;

  public requestList: FormArray;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private farmerService: FarmerService,
              private userService: UserService,
              private organisationService: OrganisationService,
              private locationService: LocationService, private messageService: MessageService) {
  }

  ngOnInit() {
    this.createForm = this.formBuilder.group({
      foreName: [''],
      surname: [''],
      email: [''],
      phone_number: [''],
      sex: [''],
      NID: [''],
      type: [''],
      requests: new FormArray([])
    });

    (this.createForm.controls.requests as FormArray).push(this.createRequest());
    this.route.params
      .subscribe(params => {
        if (params.id !== undefined) {
          this.farmerService.getPendingFarmer(params.id).subscribe(data => {
              this.farmer = data.content;
              this.createFromPending = true;
              this.id = params.id;
              const temp = {
                foreName: this.farmer.foreName,
                surname: this.farmer.surname,
                email: this.farmer.email,
                phone_number: this.farmer.phone_number,
                NID: this.farmer.NID,
                requests: [{
                  numberOfTrees: this.farmer.numberOfTrees,
                  fertilizer_need: this.farmer.fertilizer_need,
                  fertilizer_allocate: this.farmer.fertilizer_allocate
                }]
              };
              if (this.farmer.NID !== '') {
                this.userService.verifyNID(this.farmer.NID).subscribe(NIDInformation => {
                    temp['foreName'.toString()] = NIDInformation.content.foreName;
                    temp['surname'.toString()] = NIDInformation.content.surname;
                    temp['sex'.toString()] = NIDInformation.content.sex.toLowerCase();
                  },
                  (err) => {
                  });
              }

              this.createForm.patchValue(temp);
            },
            (err) => {
              this.createFromPending = true;
              this.errors = ['Record does not exist!'];
            });
        }
      });
    this.initial();
  }

  onSubmit() {
    if (this.createForm.valid) {
      console.log('test');
      if (this.createFromPending) {
        console.log('test 2');
        const farmer = this.createForm.value;
        farmer['fertilizer_need'.toString()] = farmer.requests[0].fertilizer_need;
        farmer['fertilizer_allocate'.toString()] = farmer.requests[0].fertilizer_allocate;
        farmer['location'.toString()] = farmer.requests[0].location;
        farmer['numberOfTrees'.toString()] = farmer.requests[0].numberOfTrees;
        farmer['_id'.toString()] = this.id;
        delete farmer.requests;
        this.farmerService.saveFromPending(farmer).subscribe((data) => {
            console.log('test 3');
            console.log(data);
            this.messageService.setMessage('Record successful moved to approved list!');
            this.router.navigateByUrl('admin/pending-farmers');
          },
          (err) => {
            this.errors = err.errors;
          });
      }
    } else {
    }
  }

  onBlurNID(nid: string) {
    if (nid !== '') {
      this.userService.verifyNID(nid).subscribe(data => {
        this.userNIDInfo['foreName'.toString()] = data.content.foreName;
        this.userNIDInfo['surname'.toString()] = data.content.surname;
        this.userNIDInfo['sex'.toString()] = data.content.sex.toLowerCase();
        this.createForm.patchValue(this.userNIDInfo);
      });
    }
  }

  createRequest(): FormGroup {
    return this.formBuilder.group({
      season: ['19B'],
      numberOfTrees: [''],
      fertilizer_need: [''],
      fertilizer_allocate: [''],
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: ['']
      })
    });
  }

  get formRequests() {
    return this.createForm.get('requests') as FormArray;
  }

  onCancel() {
    console.log('test');
    if (this.createFromPending) {
      this.router.navigateByUrl('/admin/pending-farmers');
    } else {
      this.router.navigateByUrl('/admin/farmers');
    }
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
