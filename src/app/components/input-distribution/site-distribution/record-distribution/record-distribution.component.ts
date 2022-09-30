import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {
  AuthenticationService,
  BasicComponent,
  ConfirmDialogService,
  HelperService,
  InputDistributionService,
  MessageService,
  Organisation,
  OrganisationService,
} from '../../../../core';

import {StockOut} from '../../../../core/models/stockout.model';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-record-distribution',
  templateUrl: './record-distribution.component.html',
  styleUrls: ['./record-distribution.component.css']
})
export class RecordDistributionComponent extends BasicComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() requestId;
  @Input() regNumber;
  @Input() documentId;
  @Input() siteId;
  @Input() inputApplicationId;
  @Input() numberOfTrees;
  distributionForm: FormGroup;
  updateRequestForm: FormGroup;
  errors: string [];
  message: string;
  stockOuts: StockOut[] = [];
  comments = [
    {value: 1, description: 'Kudakorera kawa'},
    {value: 2, description: 'Kutagira ibiti bya kawa'},
    {value: 3, description: 'Kawa zitaragira ibitumbwe'},
    {value: 4, description: 'Umubare w ikawa wanditse uratandukanye'},
    {value: 5, description: 'Yongerewe ifumbire iyo yahawe ntihagije'},
    {value: 6, description: 'Akora ubuhinzi bwa kawa bw umwimerere'}
  ];
  org: Organisation;
  isLoading = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private confirmDialogService: ConfirmDialogService,
    private helper: HelperService, private inputDistributionService: InputDistributionService,
    private organisationService: OrganisationService) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit(): void {
    this.distributionForm = this.formBuilder.group({
      quantity: ['', Validators.required],
      stockOutId: [''],
      treesAtDistribution: [this.numberOfTrees, [Validators.required, Validators.min(0), Validators.max(100000)]],
      comment: ['7']
    });
    this.updateRequestForm = this.formBuilder.group({
      treesAtDistribution: [this.numberOfTrees, [Validators.required, Validators.min(0), Validators.max(100000)]],
      comment: ['7']
    });

    // Get Organisation information for the logged-in user, so we can get stock outs for cws
    this.organisationService.get(this.authenticationService.getCurrentUser().info.org_id).subscribe(data => {
      this.org = data.content;
      this.getStockOuts();
    });
  }

  getStockOuts() {
    this.inputDistributionService.getCwsStockOuts(this.org._id, this.siteId)
      .subscribe((data) => {
        data.data.map((stock) => {
          if (stock.inputId.inputType === 'Fertilizer' && stock.returnedQty === 0) {
            this.stockOuts.push(stock);
          }
        });
      });
  }

  updateRequestAtDistribution() {
    if (this.updateRequestForm.valid) {
      const record = JSON.parse(JSON.stringify(this.updateRequestForm.value));
      record['documentId'.toString()] = this.documentId;
      record['subDocumentId'.toString()] = this.requestId;
      record['siteId'.toString()] = this.siteId;
      record['comment'.toString()] = +record['comment'.toString()];
      this.inputDistributionService.updateRequestAtDistribution(record).subscribe(() => {
          this.modal.close('Successfully updated.');
          this.updateRequestForm.reset();
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
      this.isLoading = true;
      const record = JSON.parse(JSON.stringify(this.distributionForm.value));
      record['documentId'.toString()] = this.documentId;
      record['farmerRequestId'.toString()] = this.requestId;
      record['regNumber'.toString()] = this.regNumber;
      record['comment'.toString()] = +record['comment'.toString()];
      if (this.inputApplicationId.length) {
        this.confirmDialogService.openConfirmDialog('Farmer has already received fertilizer. ' +
          'do you want to give more.').afterClosed().subscribe(
          res => {
            if (res) {
              this.inputDistributionService.recordDistributionAndUpdate(record).subscribe(() => {
                  this.isLoading = false;
                  this.modal.close('Fertilizer distributed.');
                  this.distributionForm.reset();
                },
                (err) => {
                  this.setError(err.errors);
                });

            }
          });
      } else {
        this.inputDistributionService.recordDistributionAndUpdate(record).subscribe(() => {
            this.modal.close('Fertilizer distributed.');
            this.distributionForm.reset();
          },
          (err) => {
            this.setError(err.errors);
          });
      }

    } else {
      this.setError(this.helper.getFormValidationErrors(this.distributionForm));
    }
  }

  getDestination(destinations) {
    let str = '';
    destinations.map((dest) => {
      str = str + ' - ' + dest.cell_id.name;
    });
    return str;
  }
}