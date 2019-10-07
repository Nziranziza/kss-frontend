import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService, InputDistributionService} from '../../../core/services';
import {MessageService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-record-site-stock-return',
  templateUrl: './record-site-stock-return.component.html',
  styleUrls: ['./record-site-stock-return.component.css']
})
export class RecordSiteStockReturnComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() stockOutId;
  siteStockReturnForm: FormGroup;
  errors: string [];
  message: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private helper: HelperService, private inputDistributionService: InputDistributionService) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit(): void {
    this.siteStockReturnForm = this.formBuilder.group({
      returnedQty: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.siteStockReturnForm.valid) {
      const record = JSON.parse(JSON.stringify(this.siteStockReturnForm.value));
      record['stockOutId'.toString()] = this.stockOutId;
      record['userId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      this.inputDistributionService.recordStockOutReturn(record).subscribe(() => {
          this.message = 'Stock quantity returned!';
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.siteStockReturnForm);
    }
  }
}
