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
  errors: string [];
  message: string;
  currentStock: any;
  remainingQty: number;

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
    });
    /* const id = this.authenticationService.getCurrentUser().info.distributionSite; */
    const id = '5d414020075a5550b7de08bb';
    this.inputDistributionService.getSiteStockOuts(id).subscribe((data) => {
      data.content.map((item) => {
        if (item.distributedQty < item.totalQuantity) {
          this.currentStock = item;
          this.remainingQty = this.currentStock.totalQuantity - this.currentStock.distributedQty;
        }
      });
    });
  }

  onSubmit() {
    if (this.distributionForm.valid) {
      const record = JSON.parse(JSON.stringify(this.distributionForm.value));
      record['documentId'.toString()] = this.documentId;
      record['farmerRequestId'.toString()] = this.requestId;
      record['stockOutId'.toString()] = this.currentStock._id;
      record['regNumber'.toString()] = this.regNumber;
      this.inputDistributionService.recordDistribution(record).subscribe(() => {
          this.message = 'Information successfully recorded!';
          this.modal.dismiss();
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.distributionForm);
    }
  }
}
