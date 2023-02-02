import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {AuthenticationService, InputDistributionService, MessageService} from '../../../../core';
import {HelperService} from '../../../../core';
import {isPlatformBrowser} from '@angular/common';
import {BasicComponent} from '../../../../core';

@Component({
  selector: 'app-apply-pesticide',
  templateUrl: './apply-pesticide.component.html',
  styleUrls: ['./apply-pesticide.component.css']
})
export class ApplyPesticideComponent extends BasicComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() requestId;
  @Input() regNumber;
  @Input() documentId;
  @Input() siteId;
  distributionForm: UntypedFormGroup;
  errors: string [];
  message: string;
  stocks = [];

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
    this.distributionForm = this.formBuilder.group({
      pesticides: new UntypedFormArray([])
    });
    this.inputDistributionService.getCwsStockOuts(this.authenticationService.getCurrentUser()
      .info.org_id, this.siteId).subscribe((data) => {
      data.data.map((stock) => {
        if (stock.inputId.inputType === 'Pesticide' && stock.returnedQty === 0) {
          const control = new UntypedFormControl(false);
          this.stocks.push(stock);
          (this.distributionForm.controls.pesticides as UntypedFormArray).push(control);
        }
      });
    });
  }

  onSubmit() {
    if (this.distributionForm.valid) {
      const selectedPesticide = this.distributionForm.value.pesticides
        .map((checked, index) => checked ? this.stocks[index]._id : null)
        .filter(value => value !== null);
      const record = JSON.parse(JSON.stringify(this.distributionForm.value));
      record['documentId'.toString()] = this.documentId;
      record['farmerRequestId'.toString()] = this.requestId;
      record['siteId'.toString()] = this.siteId;
      record['pesticides'.toString()] = selectedPesticide;
      record['regNumber'.toString()] = this.regNumber;
      record.pesticides.map((value, i) => {
        record.pesticides [i] = {
          stockId: value
        };
      });
      this.inputDistributionService.applyPesticide(record).subscribe(() => {
          this.modal.close('Pesticide applied!');
          this.distributionForm.reset();
        },
        (err) => {
          this.setError(err.errors);
        });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.distributionForm));
    }
  }

  getDestination(destinations) {
    let str = '';
    destinations.map ((dest) => {
      str = str + ' - ' + dest.cell_id.name;
    });
    return str;
  }
}
