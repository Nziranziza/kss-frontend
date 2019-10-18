import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService, InputDistributionService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-apply-pesticide',
  templateUrl: './apply-pesticide.component.html',
  styleUrls: ['./apply-pesticide.component.css']
})
export class ApplyPesticideComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() requestId;
  @Input() regNumber;
  @Input() documentId;
  distributionForm: FormGroup;
  errors: string [];
  message: string;
  stockOuts: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private helper: HelperService, private inputDistributionService: InputDistributionService) {
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit(): void {
    this.distributionForm = this.formBuilder.group({
      pesticide: new FormArray([]),
      stockOutId: ['', Validators.required]
    });
    const id = this.authenticationService.getCurrentUser().orgInfo.distributionSite;
    this.inputDistributionService.getSiteStockOuts(this.authenticationService.getCurrentUser().orgInfo.distributionSite)
      .subscribe((data) => {
        this.stockOuts = data.content;
        this.stockOuts.map(() => {
          const control = new FormControl(false);
          (this.distributionForm.controls.pesticide as FormArray).push(control);
        });
      });
  }

  onSubmit() {
    if (this.distributionForm.valid) {
      const record = JSON.parse(JSON.stringify(this.distributionForm.value));
      record['documentId'.toString()] = this.documentId;
      record['farmerRequestId'.toString()] = this.requestId;
      record['siteId'.toString()] = this.authenticationService.getCurrentUser().orgInfo.distributionSite;
      this.inputDistributionService.updateRequestAtDistribution(record).subscribe(() => {
          this.message = 'Pesticide applied!';
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.distributionForm);
    }
  }
}
