import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LocationService} from '../../../core';
import {HelperService} from '../../../core';
import {AuthenticationService, FarmerService} from '../../../core';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-edit-request',
  templateUrl: './edit-request.component.html',
  styleUrls: ['./edit-request.component.css']
})
export class EditRequestComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() land;
  editFarmerRequestForm: FormGroup;
  errors: string [];
  message: string;
  submit = false;
  farmerId: string;
  currentSeason: any;
  farmer: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder, private locationService: LocationService,
    private helper: HelperService, private farmerService: FarmerService,
    private authenticationService: AuthenticationService) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.editFarmerRequestForm = this.formBuilder.group({
      treesAtDistribution: ['', [Validators.required,
        Validators.min(1), Validators.pattern('[0-9]*')]],
      comment: ['']
    });
    this.currentSeason = this.authenticationService.getCurrentSeason();
    this.farmerService.get(this.farmerId).subscribe(data => {
      this.farmer = data.content[0];
    });
  }

  onSubmit() {
    if (this.editFarmerRequestForm.valid) {
      const request = JSON.parse(JSON.stringify(this.editFarmerRequestForm.value));
      request['documentId'.toString()] = this.farmerId;
      request['subDocumentId'.toString()] = this.land._id;
      this.farmerService.updateFarmerRequest(request).subscribe(() => {
          this.message = 'Information successfully updated.';
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = ['Missing required information.'];
    }
  }
}
