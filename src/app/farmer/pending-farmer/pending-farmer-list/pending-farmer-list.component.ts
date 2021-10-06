import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService, FarmerService} from '../../../core/services';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MessageService} from '../../../core/services';
import {AuthorisationService} from '../../../core/services';
import {BasicComponent} from '../../../core/library';

@Component({
  selector: 'app-pending-farmer-list',
  templateUrl: './pending-farmer-list.component.html',
  styleUrls: ['./pending-farmer-list.component.css']
})
export class PendingFarmerListComponent extends BasicComponent implements OnInit, OnDestroy {

  isDistrictCashCrop = false;
  farmers = [];
  maxSize = 9;
  showData = false;
  order = 'foreName';
  reverse = true;
  directionLinks = true;
  filterForm: FormGroup;
  title = 'Temporary Farmers';
  i: number;
  parameters: any;
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
  loading = true;
  searchFields = [
    {value: 'phone_number', name: 'phone number'},
    {value: 'nid', name: 'NID'},
    {value: 'foreName', name: 'first name'},
    {value: 'surname', name: 'last name'},
  ];
  isCwsOfficer = false;

  constructor(private farmerService: FarmerService,
              private router: Router, private authorisationService: AuthorisationService,
              private authenticationService: AuthenticationService,
              private modal: NgbModal, private formBuilder: FormBuilder, private messageService: MessageService) {
    super();
    this.parameters = {
      length: 25,
      start: 0,
      draw: 1
    };
  }

  ngOnInit() {
    this.isDistrictCashCrop = this.authorisationService.isDistrictCashCropOfficer();
    this.isCwsOfficer = this.authorisationService.isCWSUser();
    this.getFarmers();
    this.filterForm = this.formBuilder.group({
      term: ['', Validators.minLength(3)],
      searchBy: ['foreName']
    });
    this.message = this.messageService.getMessage();
  }

  onPageChange(event) {
    this.config.currentPage = event;
    if (event > 1) {
      this.parameters.start = (event - 1) * this.config.itemsPerPage;
    }
    let asDcc;
    if (this.isDistrictCashCrop) {
      asDcc = 'dcc';
      this.parameters['dist_id'.toString()] = this.authenticationService.getCurrentUser().info.location.dist_id;
    }
    this.farmerService.getPendingFarmers(this.parameters, asDcc)
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
      let asDcc;
      if (this.isDistrictCashCrop) {
        asDcc = 'dcc';
        this.parameters['dist_id'.toString()] = this.authenticationService.getCurrentUser().info.location.dist_id;
      }
      this.farmerService.getPendingFarmers(this.parameters, asDcc)
        .subscribe(data => {
          this.farmers = data.data;
          this.config = {
            itemsPerPage: this.parameters.length,
            currentPage: this.parameters.start + 1,
            totalItems: data.recordsTotal
          };
          this.clear();
        }, (err) => {
          this.setError(err.errors);
        });
    }
  }

  ngOnDestroy(): void {
    this.messageService.setMessage('');
  }

  canApprove() {
    let canApprove = false;
    if (this.authorisationService.isTechouseUser() || this.authorisationService.isDistrictCashCropOfficer()) {
      canApprove = true;
    }
    return canApprove;
  }

  onClearFilter() {
    this.filterForm.controls.term.reset();
    delete this.parameters.search;
    this.loading = true;
    let asDcc;
    if (this.isDistrictCashCrop) {
      asDcc = 'dcc';
      this.parameters['dist_id'.toString()] = this.authenticationService.getCurrentUser().info.location.dist_id;
    }
    this.farmerService.getPendingFarmers(this.parameters, asDcc)
      .subscribe(data => {
        this.farmers = data.data;
        this.loading = false;
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal
        };
      });
  }

  getFarmers() {
    let asDcc;
    if (this.isDistrictCashCrop) {
      asDcc = 'dcc';
      this.parameters['dist_id'.toString()] = this.authenticationService.getCurrentUser().info.location.dist_id;
    }
    this.loading = true;
    this.farmerService.getPendingFarmers(this.parameters, asDcc)
      .subscribe(data => {
        this.farmers = data.data;
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal
        };
        this.showData = true;
        this.loading = false;
      });

  }
}
