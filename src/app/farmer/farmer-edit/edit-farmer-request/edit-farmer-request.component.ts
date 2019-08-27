import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HelperService} from '../../../core/helpers';
import {AuthenticationService, FarmerService} from '../../../core/services';
import {isPlatformBrowser} from '@angular/common';
import {LocationService} from '../../../core/services';
import {AuthorisationService} from '../../../core/services';

@Component({
  selector: 'app-edit-farmer-request',
  templateUrl: './edit-farmer-request.component.html',
  styleUrls: ['./edit-farmer-request.component.css']
})
export class EditFarmerRequestComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() land;
  editFarmerRequestForm: FormGroup;
  errors: string [];
  message: string;
  submit = false;
  farmerId: string;
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  currentSeason: any;
  isUserCWSOfficer = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder, private locationService: LocationService,
    private helper: HelperService, private farmerService: FarmerService,
    private authenticationService: AuthenticationService, private authorisationService: AuthorisationService) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.editFarmerRequestForm = this.formBuilder.group({
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
    const temp = {
      numberOfTrees: this.land.numberOfTrees,
      fertilizer_need: this.land.fertilizer_need,
      fertilizer_allocate: this.land.fertilizer_allocate,
      location: {}
    };
    this.currentSeason = this.authenticationService.getCurrentSeason();
    this.isUserCWSOfficer = this.authorisationService.isCWSUser();

    temp.location['prov_id'.toString()] = this.land.location.prov_id._id;
    temp.location['dist_id'.toString()] = this.land.location.dist_id._id;
    temp.location['sect_id'.toString()] = this.land.location.sect_id._id;
    temp.location['cell_id'.toString()] = this.land.location.cell_id._id;
    temp.location['village_id'.toString()] = this.land.location.village_id._id;
    this.initial();
    this.locationService.getDistricts(this.land.location.prov_id._id).subscribe((districts) => {
      this.districts = districts;
    });
    this.locationService.getSectors(this.land.location.dist_id._id).subscribe((sectors) => {
      this.sectors = sectors;
    });
    this.locationService.getCells(this.land.location.sect_id._id).subscribe((cells) => {
      this.cells = cells;
    });
    this.locationService.getVillages(this.land.location.cell_id._id).subscribe((villages) => {
      this.villages = villages;
    });
    this.editFarmerRequestForm.patchValue(temp);
    this.onChanges();
  }

  onChanges() {
    this.editFarmerRequestForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
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
    this.editFarmerRequestForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
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
    this.editFarmerRequestForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          this.locationService.getCells(value).subscribe((data) => {
            this.cells = data;
            this.villages = null;
          });
        }
      }
    );
    this.editFarmerRequestForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
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

  getLocationInput(field: string) {
    return this.editFarmerRequestForm.controls.location.get(field);
  }

  onSubmit() {
    if (this.editFarmerRequestForm.valid) {
      const request = this.editFarmerRequestForm.value;
      request['fertilizer_need'.toString()] =
        +request['numberOfTrees'.toString()] * this.currentSeason.seasonParams.fertilizerKgPerTree.$numberDouble;
      request['documentId'.toString()] = this.farmerId;
      request['subDocumentId'.toString()] = this.land._id;
      request['userId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      this.farmerService.updateFarmerRequest(request).subscribe(() => {
          this.message = 'request successfully updated!';
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = ['Missing required land(s) information'];
    }
  }
}
