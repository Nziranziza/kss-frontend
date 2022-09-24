import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService, AuthorisationService, OrganisationTypeService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {InputDistributionService} from '../../../core/services';
import {RecordDistributionComponent} from './record-distribution/record-distribution.component';
import {MessageService} from '../../../core/services';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ApplyPesticideComponent} from './apply-pesticide/apply-pesticide.component';
import {BasicComponent} from '../../../core/library';
import {ActivatedRoute, Router} from '@angular/router';
import {WarehouseDispatchEditComponent} from '../warehouse/warehouse-dispatch-edit/warehouse-dispatch-edit.component';

@Component({
  selector: 'app-site-distribution',
  templateUrl: './site-distribution.component.html',
  styleUrls: ['./site-distribution.component.css']
})

export class SiteDistributionComponent extends BasicComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private authenticationService: AuthenticationService,
              private organisationTypeService: OrganisationTypeService,
              private authorisationService: AuthorisationService,
              private inputDistributionService: InputDistributionService,
              private helper: HelperService,
              private route: ActivatedRoute,
              private messageService: MessageService,
              private router: Router,
              private modal: NgbModal) {
    super();
  }

  getFarmerRequestsForm: FormGroup;
  requests: any;
  regNumber: string;
  requestsOf: any;
  documentId: string;
  siteId: string;

  ngOnInit() {
    this.getFarmerRequestsForm = this.formBuilder.group({
      farmerRegNumber: ['', Validators.required]
    });
    this.route.params.subscribe(params => {
      this.siteId = params['siteId'.toString()];
    });
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }

  recordDistribution(requestId: string, documentId: string, inputApplicationId?: string, numberOfTrees?: string) {
    const modalRef = this.modal.open(RecordDistributionComponent, {size: 'lg'});
    modalRef.componentInstance.requestId = requestId;
    modalRef.componentInstance.regNumber = this.regNumber;
    modalRef.componentInstance.siteId = this.siteId;
    modalRef.componentInstance.documentId = documentId;
    modalRef.componentInstance.inputApplicationId = inputApplicationId;
    modalRef.componentInstance.numberOfTrees = numberOfTrees;
    modalRef.result.then((message) => {
      this.setMessage(message);
      this.inputDistributionService.getFarmerRequestsAsCWS(this.authenticationService.getCurrentUser()
        .info.org_id, this.requestsOf.farmerRegNumber, this.siteId).subscribe((data) => {
        this.requests = data.content[0].request.requestInfo;
      });
    });
  }


  onGetFarmerRequests() {
    if (this.getFarmerRequestsForm.valid) {
      const requestsOf = JSON.parse(JSON.stringify(this.getFarmerRequestsForm.value));
      requestsOf['managerUserId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      this.requestsOf = requestsOf;
      if (this.authorisationService.isCWSAdmin()) {
        this.inputDistributionService.getFarmerRequestsAsCWS(this.authenticationService.getCurrentUser()
          .info.org_id, requestsOf.farmerRegNumber, this.siteId).subscribe((data) => {
          this.requests = data.content[0].request.requestInfo;
          this.documentId = data.content[0].request._id;
          this.regNumber = requestsOf.farmerRegNumber;
        }, (err) => {
          this.setError(err.errors);
        });
      } else {
        this.inputDistributionService.getFarmerRequests(this.requestsOf).subscribe((data) => {
          this.requests = data.content[0].requestInfo;
          this.documentId = data.content[0]._id;
          this.regNumber = requestsOf.farmerRegNumber;
        }, (err) => {
          this.setError(err.errors);
        });
      }
    } else {
      this.setError(this.helper.getFormValidationErrors(this.getFarmerRequestsForm));
    }
  }

  applyPesticide(requestId: string, documentId: string) {
    const modalRef = this.modal.open(ApplyPesticideComponent, {size: 'lg'});
    modalRef.componentInstance.requestId = requestId;
    modalRef.componentInstance.regNumber = this.regNumber;
    modalRef.componentInstance.siteId = this.siteId;
    modalRef.componentInstance.documentId = documentId;
    modalRef.result.then((message) => {
      this.setMessage(message);
      this.inputDistributionService.getFarmerRequests(this.requestsOf).subscribe((data) => {
        this.requests = data.content[0].requestInfo;
      });
    });
  }
}
