import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthorisationService, FarmerService, MessageService, SiteService} from '../../../core/services';
import {AuthenticationService} from '../../../core/services';
import {BasicComponent} from '../../../core/library';
import {Farmer} from '../../../core/models';
import {FarmerDetailsComponent} from '../farmer-details/farmer-details.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SharedDataService} from '../../../core/services/shared-data.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HelperService} from '../../../core/helpers';

@Component({
  selector: 'app-farmer-need-approval-list',
  templateUrl: './farmer-need-approval-list.component.html',
  styleUrls: ['./farmer-need-approval-list.component.css']
})

export class FarmerNeedApprovalListComponent extends BasicComponent implements OnInit {

  requestIds = [];
  title = 'Farmers info to be approved';
  filterForm: FormGroup;
  sites: any;
  requests = [];
  /*---------------------------- DataTable variables --------------------*/
  config: any;
  maxSize = 9;
  order = 'userInfo.foreName';
  reverse = true;
  directionLinks = true;
  parameters: any;
  labels: any = {
    previousLabel: 'Previous',
    nextLabel: 'Next',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };
  autoHide = false;
  isFilterDone = false;
  siteId: any;
  showData = false;
  needApprovalListType = 'updated';

  @Output() needOfApprovalEvent = new EventEmitter<any>();

  /*------------------------- End dataTable variables --------------------*/

  constructor(private formBuilder: FormBuilder,
              private modal: NgbModal,
              private route: ActivatedRoute,
              private router: Router,
              private messageService: MessageService,
              private helper: HelperService,
              private authorisationService: AuthorisationService,
              private sharedDataService: SharedDataService,
              private siteService: SiteService, private farmerService: FarmerService,
              private authenticationService: AuthenticationService) {
    super();
    this.parameters = {
      length: 25,
      start: 0,
      draw: 1
    };
  }

  ngOnInit() {
    this.filterForm = this.formBuilder.group({
      site: ['']
    });
    const body = {
      searchBy: 'district',
      dist_id: this.authenticationService.getCurrentUser().info.location.dist_id
    };
    this.route.params.subscribe(params => {
      this.needApprovalListType = params['needApproval'.toString()];
      if (!(this.needApprovalListType === 'updated' || this.needApprovalListType === 'new')) {
        this.router.navigateByUrl('404');
      } else {
        this.requests = [];
        this.filterForm.controls.site.setValue('');
        this.needApprovalListType === 'updated' ? this.title = 'Updated lands to be approved' : this.title =
          'New lands to be approved';
      }
    });
    this.siteService.getSite(body).subscribe((data) => {
      this.sites = data.content;
    });
    this.sharedDataService.changeApprovalFlag();
    this.message = this.messageService.getMessage();
    this.messageService.clearMessage();

  }

  onPageChange(event) {
    this.config.currentPage = event;
    if (event >= 1) {
      this.parameters.start = (event - 1) * this.config.itemsPerPage;
    }

    this.farmerService.getUpdatedLandsWaitingForApproval(this.parameters)
      .subscribe(data => {
        this.requests = data.data;
      });
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  selectRequest(isChecked: boolean, farmer) {
    if (isChecked) {
      this.requestIds.push({documentId: farmer.requests._id, subDocumentId: farmer.requests.requestInfo._id});
    } else {
      this.requestIds = this.requestIds.filter((value) => {
        return value.documentId !== farmer.requests._id;
      });
    }
  }

  viewDetails(farmer: Farmer) {
    const modalRef = this.modal.open(FarmerDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.farmer = farmer;
  }

  onFilter() {
    if (this.filterForm.valid) {
      const filter = this.filterForm.value;
      this.siteId = filter.site;
      this.parameters['siteId'.toString()] = filter.site;
      if (this.needApprovalListType === 'updated') {
        this.getUpdatesWaitingForApproval();
      } else {
        this.getNewLandsWaitingForApproval();
      }
    } else {
      this.setError(this.helper.getFormValidationErrors(this.filterForm));
    }
  }

  onApprove() {
    if (this.requestIds.length < 1) {
      this.setError(['please select records to be approved']);
      return;
    }
    if (this.needApprovalListType === 'updated') {
      this.farmerService.approveLandsUpdate({
        siteId: this.siteId,
        requests: this.requestIds
      })
        .subscribe(() => {
          this.setMessage('changes successful approved.');
          this.sharedDataService.changeApprovalFlag();
          this.getUpdatesWaitingForApproval();
        });
    } else {
      this.farmerService.approveNewLands({
        siteId: this.siteId,
        requests: this.requestIds
      })
        .subscribe(() => {
          this.setMessage('changes successful approved.');
          this.sharedDataService.changeApprovalFlag();
          this.getNewLandsWaitingForApproval();
        });
    }
  }

  getNewLandsWaitingForApproval() {
    this.farmerService.getNewLandsWaitingForApproval(this.parameters)
      .subscribe(data => {
        this.requests = data.data;
        this.showData = true;
        this.config = {
          itemsPerPage: data.recordsTotal < this.parameters.length ? data.recordsTotal : this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal
        };
        this.isFilterDone = true;
      }, (err) => {
        if (err.status === 404) {
          this.setMessage('All new lands are approved');
          this.requests = [];
          this.config.currentPage = 1;
          this.config.totalItems = 0;
        } else {
          this.setError(err.errors);
        }
      });
  }

  getEditor(requests: any) {
    let contact;
    if (requests.requestInfo.updatedBy) {
      contact = requests.requestInfo.updatedBy.surname + ' ' +
        requests.requestInfo.updatedBy.foreName + ', ' + requests.requestInfo.updatedBy.phone_number;
    }
    if (requests.requestInfo.createdBy) {
      contact = requests.requestInfo.createdBy.surname + ' ' +
        requests.requestInfo.createdBy.foreName + ', ' + requests.requestInfo.createdBy.phone_number;
    }
    return contact;
  }

  getUpdatesWaitingForApproval() {
    this.farmerService.getUpdatedLandsWaitingForApproval(this.parameters)
      .subscribe(data => {
        this.requests = data.data;
        this.showData = true;
        this.config = {
          itemsPerPage: data.recordsTotal < this.parameters.length ? data.recordsTotal : this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal
        };
        this.isFilterDone = true;
      }, (err) => {
        if (err.status === 404) {
          this.setMessage('All lands updates are approved');
          this.requests = [];
          this.config.currentPage = 1;
          this.config.totalItems = 0;
        } else {
          this.setError(err.errors);
        }
      });
  }
}
