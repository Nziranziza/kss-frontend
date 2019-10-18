import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService, OrganisationTypeService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {InputDistributionService} from '../../core/services';
import {RecordDistributionComponent} from './record-distribution/record-distribution.component';
import {MessageService} from '../../core/services';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ApplyPesticideComponent} from './apply-pesticide/apply-pesticide.component';

@Component({
  selector: 'app-site-distribution',
  templateUrl: './site-distribution.component.html',
  styleUrls: ['./site-distribution.component.css']
})

export class SiteDistributionComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private authenticationService: AuthenticationService,
              private organisationTypeService: OrganisationTypeService,
              private inputDistributionService: InputDistributionService,
              private helper: HelperService,
              private messageService: MessageService,
              private modal: NgbModal) {
  }

  getFarmerRequestsForm: FormGroup;
  errors: string[];
  requests: any;
  regNumber: string;
  requestsOf: any;

  ngOnInit() {
    this.getFarmerRequestsForm = this.formBuilder.group({
      farmerRegNumber: ['', Validators.required]
    });
  }

  recordDistribution(requestId: string, documentId: string) {
    const modalRef = this.modal.open(RecordDistributionComponent, {size: 'lg'});
    modalRef.componentInstance.requestId = requestId;
    modalRef.componentInstance.regNumber = this.regNumber;
    modalRef.componentInstance.documentId = documentId;
    modalRef.result.finally(() => {
      this.inputDistributionService.getFarmerRequests(this.requestsOf).subscribe((data) => {
        this.requests = data.content;
      });
    });
  }

  onGetFarmerRequests() {
    if (this.getFarmerRequestsForm.valid) {
      const requestsOf = JSON.parse(JSON.stringify(this.getFarmerRequestsForm.value));
      requestsOf['managerUserId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      this.requestsOf = requestsOf;
      this.inputDistributionService.getFarmerRequests(requestsOf).subscribe((data) => {
        this.requests = data.content;
        this.regNumber = requestsOf.farmerRegNumber;
      }, (err) => {
        this.errors = err.errors;
      });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.getFarmerRequestsForm);
    }
  }

  applyPesticide(requestId: string, documentId: string) {
    const modalRef = this.modal.open(ApplyPesticideComponent, {size: 'lg'});
    modalRef.componentInstance.requestId = requestId;
    modalRef.componentInstance.regNumber = this.regNumber;
    modalRef.componentInstance.documentId = documentId;
    modalRef.result.finally(() => {
      this.inputDistributionService.getFarmerRequests(this.requestsOf).subscribe((data) => {
        this.requests = data.content;
      });
    });
  }
}
