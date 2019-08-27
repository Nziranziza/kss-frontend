import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../../../core/services';
import {MessageService} from '../../../core/services/message.service';
import {HelperService} from '../../../core/helpers';
import {InputDistributionService} from '../../../core/services/input-distribution.service';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-record-site-stock-out',
  templateUrl: './record-site-stock-out.component.html',
  styleUrls: ['./record-site-stock-out.component.css']
})
export class RecordSiteStockOutComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() dispatchId;
  siteStockOutForm: FormGroup;
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
    this.siteStockOutForm = this.formBuilder.group({
      numberOfBags: ['', Validators.required],
      totalQty: ['', Validators.required],
      date: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.siteStockOutForm.valid) {
      const record = JSON.parse(JSON.stringify(this.siteStockOutForm.value));
      record['dispatchId'.toString()] = this.dispatchId;
      record['userId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      this.inputDistributionService.recordStockOut(record).subscribe(() => {
          this.messageService.setMessage('Stock out recorded!');
          this.modal.dismiss();
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.siteStockOutForm);
    }
  }
}
