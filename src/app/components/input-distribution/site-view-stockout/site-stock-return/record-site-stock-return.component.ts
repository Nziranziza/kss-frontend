import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AuthenticationService, InputDistributionService} from '../../../../core/services';
import {MessageService} from '../../../../core/services';
import {HelperService} from '../../../../core/helpers';
import {isPlatformBrowser} from '@angular/common';
import {BasicComponent} from '../../../../core/library';

@Component({
  selector: 'app-record-site-stock-return',
  templateUrl: './record-site-stock-return.component.html',
  styleUrls: ['./record-site-stock-return.component.css']
})
export class RecordSiteStockReturnComponent extends BasicComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() stockOutId;
  siteStockReturnForm: UntypedFormGroup;
  errors: string [];
  message: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: UntypedFormBuilder,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private helper: HelperService, private inputDistributionService: InputDistributionService) {
    super();
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
          this.messageService.setMessage('Stock quantity returned');
          this.siteStockReturnForm.reset();
          this.modal.dismiss();
        },
        (err) => {
          this.setError(err.errors);
        });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.siteStockReturnForm));
    }
  }
}
