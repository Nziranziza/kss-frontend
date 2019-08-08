import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService, OrganisationService} from '../../core/services';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MessageService} from '../../core/services/message.service';

@Component({
  selector: 'app-organisation-pending-farmers',
  templateUrl: './organisation-pending-farmers.component.html',
  styleUrls: ['./organisation-pending-farmers.component.css']
})
export class OrganisationPendingFarmersComponent implements OnInit, OnDestroy {

  constructor(private organisationService: OrganisationService, private route: ActivatedRoute,
              private router: Router, private authenticationService: AuthenticationService,
              private modal: NgbModal, private formBuilder: FormBuilder, private messageService: MessageService) {
    this.parameters = {
      length: 25,
      start: 0,
      draw: 1
    };
  }

  message: string;
  farmers: any;
  maxSize = 9;
  order = 'foreName';
  reverse = true;
  directionLinks = true;
  filterForm: FormGroup;
  title = 'Temporary Farmers';
  i: number;
  parameters: any;
  org: any;
  config: any;
  autoHide = false;
  responsive = true;
  labels: any = {
    previousLabel: 'Previous',
    nextLabel: 'Next',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };
  orgId: string;
  loading = false;
  searchFields = [
    {value: 'phone_number', name: 'phone number'},
    {value: 'nid', name: 'NID'},
    {value: 'forename', name: 'first name'},
    {value: 'surname', name: 'last name'},
  ];

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orgId = params['organisationId'.toString()];
    });
    this.organisationService.get(this.orgId).subscribe(data => {
      this.org = data.content;
    });
    this.organisationService.getOrgPendingFarmers(this.orgId, this.parameters)
      .subscribe(data => {
        this.farmers = data.data;
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal
        };
      });
    this.filterForm = this.formBuilder.group({
      term: ['', Validators.minLength(3)],
      searchBy: ['forename']
    });
    this.message = this.messageService.getMessage();
  }

  onPageChange(event) {
    this.config.currentPage = event;
    if (event > 1) {
      this.parameters.start = (event - 1) * this.config.itemsPerPage;
    }

    this.organisationService.getOrgPendingFarmers(this.orgId, this.parameters)
      .subscribe(data => {
        this.farmers = data.data;
      });
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  onFilter() {
    if (this.filterForm.valid) {
      this.loading = true;
      this.parameters['search'.toString()] = this.filterForm.value;
      this.organisationService.getOrgPendingFarmers(this.orgId, this.parameters)
        .subscribe(data => {
          this.farmers = data.data;
          this.config = {
            itemsPerPage: this.parameters.length,
            currentPage: this.parameters.start + 1,
            totalItems: data.recordsTotal
          };
          this.loading = false;
        });
    }
  }

  ngOnDestroy(): void {
    this.messageService.setMessage('');
  }

  onClearFilter() {
    this.filterForm.controls.term.reset();
    delete this.parameters.search;
    this.organisationService.getOrgPendingFarmers(this.orgId, this.parameters)
      .subscribe(data => {
        this.farmers = data.data;
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal
        };
      });
  }

}
