import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HelperService} from '../../../core/helpers';
import {isPlatformBrowser} from '@angular/common';
import {InputDistributionService} from '../../../core/services';
import {AuthenticationService} from '../../../core/services';

@Component({
  selector: 'app-record-distribution',
  templateUrl: './record-distribution.component.html',
  styleUrls: ['./record-distribution.component.css']
})
export class RecordDistributionComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() requestId;
  @Input() regNumber;
  @Input() documentId;
  distributionForm: FormGroup;
  updateRequestForm: FormGroup;
  errors: string [];
  message: string;
  currentStockFertilizer: any;
  remainingQtyFertilizer = 0;
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
      quantity: ['', Validators.required],
      stockOutId: ['', Validators.required]
    });
    this.updateRequestForm = this.formBuilder.group({
      treesAtDistribution: ['', Validators.required],
      comment: ['', Validators.required]
    });
    const id = this.authenticationService.getCurrentUser().orgInfo.distributionSite;
    this.inputDistributionService.getSiteStockOuts(id).subscribe((data) => {
      data.content.map((item) => {
        if (item.distributedQty < item.totalQuantity) {
          if (item.dispatchId.inputType === 'Fertilizer') {
            this.currentStockFertilizer = item;
            this.remainingQtyFertilizer = this.currentStockFertilizer.totalQuantity - this.currentStockFertilizer.distributedQty;
          }
        }
      });
    });
    this.inputDistributionService.getSiteStockOuts(this.authenticationService.getCurrentUser().orgInfo.distributionSite)
      .subscribe((data) => {
        this.stockOuts = data.content;
      });
  }

  updateRequestAtDistribution() {
    if (this.distributionForm.valid) {
      const record = JSON.parse(JSON.stringify(this.distributionForm.value));
      record['documentId'.toString()] = this.documentId;
      record['farmerRequestId'.toString()] = this.requestId;
      record['siteId'.toString()] = this.authenticationService.getCurrentUser().orgInfo.distributionSite;
      this.inputDistributionService.updateRequestAtDistribution(record).subscribe(() => {
          this.message = 'Information successfully updated!';
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.distributionForm);
    }
  }

  onSubmit() {
    if (this.updateRequestForm.valid) {
      const record = JSON.parse(JSON.stringify(this.updateRequestForm.value));
      record['documentId'.toString()] = this.documentId;
      record['farmerRequestId'.toString()] = this.requestId;
      record['stockOutId'.toString()] = this.currentStockFertilizer._id;
      record['regNumber'.toString()] = this.regNumber;
      this.inputDistributionService.recordDistribution(record).subscribe(() => {
          this.message = 'Information successfully recorded!';
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.distributionForm);
    }
  }
}
