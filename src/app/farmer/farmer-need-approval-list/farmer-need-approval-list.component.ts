import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {FarmerService, MessageService, SiteService} from '../../core/services';
import {AuthenticationService} from '../../core/services';
import {BasicComponent} from '../../core/library';
import {Farmer} from '../../core/models';
import {FarmerDetailsComponent} from '../farmer-details/farmer-details.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

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
  /*----------------------------DataTable variables--------------------*/
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

  /*-------------------------End dataTable variables--------------------*/

  constructor(private formBuilder: FormBuilder,
              private modal: NgbModal,
              private messageService: MessageService,
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

    this.siteService.getSite(body).subscribe((data) => {
      this.sites = data.content;
    });

    this.message = this.messageService.getMessage();
    this.messageService.clearMessage();

  }

  onPageChange(event) {
    this.config.currentPage = event;
    if (event >= 1) {
      this.parameters.start = (event - 1) * this.config.itemsPerPage;
    }

    this.farmerService.getUpdatesWaitingForApproval(this.parameters)
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
      this.requestIds.filter((value) => {
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
      this.farmerService.getUpdatesWaitingForApproval(this.parameters)
        .subscribe(data => {
          this.requests = data.data;
          this.showData = true;
          this.config = {
            itemsPerPage: this.parameters.length,
            currentPage: this.parameters.start + 1,
            totalItems: data.recordsTotal
          };
          this.isFilterDone = true;
        });
    }
  }

  onApprove() {
    if (this.requestIds.length < 1) {
      this.setError(['please select records to be approved']);
      return;
    }
    this.farmerService.approveLandsUpdate({
      siteId: this.siteId,
      requests: this.requestIds
    })
      .subscribe(() => {
        this.setMessage('changes successful approved.');
        this.messageService.setMessage('changes successful approved.');
      }, (err) => {
        this.setError(err.errors);
      });
  }
}
