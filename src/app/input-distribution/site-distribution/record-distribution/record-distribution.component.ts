import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HelperService} from '../../../core/helpers';
import {isPlatformBrowser} from '@angular/common';
import {InputDistributionService, SiteService} from '../../../core/services';
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
  stockOuts: any;
  comments = [
    { value: 1, description: 'Kudakorera kawa'},
    { value: 2, description: 'Kutagira ibiti bya kawa'},
    { value: 3, description: 'Kawa zitaragira ibitumbwe'},
    { value: 4, description: 'Umubare w ikawa wanditse uratandukanye'},
    { value: 5, description: 'Yongerewe ifumbire iyo yahawe ntihagije'},
    { value: 6, description: 'Akora ubuhinzi bwa kawa bw umwimerere'}
  ];

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
      stockOutId: ['']
    });
    this.updateRequestForm = this.formBuilder.group({
      treesAtDistribution: ['', Validators.required],
      comment: ['', Validators.required]
    });
    const id = this.authenticationService.getCurrentUser().orgInfo.distributionSite;
    this.inputDistributionService.getSiteStockOuts(id)
      .subscribe((data) => {
        this.stockOuts = data.content;
      });
  }

  updateRequestAtDistribution() {
    if (this.updateRequestForm.valid) {
      const record = JSON.parse(JSON.stringify(this.updateRequestForm.value));
      record['documentId'.toString()] = this.documentId;
      record['subDocumentId'.toString()] = this.requestId;
      record['siteId'.toString()] = this.authenticationService.getCurrentUser().orgInfo.distributionSite;
      this.inputDistributionService.updateRequestAtDistribution(record).subscribe(() => {
          this.setMessage('Successfully updated.');
        },
        (err) => {
          this.setError(err.errors);
        });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.updateRequestForm));
    }
  }

  onSubmit() {
    if (this.distributionForm.valid) {
      const record = JSON.parse(JSON.stringify(this.distributionForm.value));
      record['documentId'.toString()] = this.documentId;
      record['farmerRequestId'.toString()] = this.requestId;
      record['regNumber'.toString()] = this.regNumber;
      this.inputDistributionService.recordDistribution(record).subscribe(() => {
          this.setMessage('Fertilizer distributed.');
        },
        (err) => {
          this.setError(err.errors);
        });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.distributionForm));
    }
  }

  setError(errors: any) {
    this.errors = errors;
    this.message = undefined;
  }

  setMessage(message: string) {
    this.errors = undefined;
    this.message = message;
  }
}
