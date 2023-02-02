import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService, OrganisationService} from '../../../core/services';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ExcelServicesService} from '../../../core/services';
import {HttpClient} from '@angular/common/http';
import {MessageService} from '../../../core/services';
import {AuthorisationService} from '../../../core/services';

@Component({
  selector: 'app-organisation-pending-farmers',
  templateUrl: './organisation-pending-farmers.component.html',
  styleUrls: ['./organisation-pending-farmers.component.css']
})
export class OrganisationPendingFarmersComponent implements OnInit, OnDestroy {

  constructor(private organisationService: OrganisationService, private route: ActivatedRoute,
              private router: Router, private authenticationService: AuthenticationService,
              private authorisationService: AuthorisationService,
              private excelService: ExcelServicesService, private http: HttpClient,
              private modal: NgbModal, private formBuilder: UntypedFormBuilder, private messageService: MessageService) {
  }

  message: string;
  farmers = [];
  maxSize = 9;
  order = 'foreName';
  reverse = true;
  directionLinks = true;
  filterForm: UntypedFormGroup;
  title = 'Temporary Farmers';
  i: number;
  parameters: any;
  showData = false;
  org: any;
  config: any;
  autoHide = true;
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
  allPendingFarmers = [];
  searchFields = [
    {value: 'phone_number', name: 'phone number'},
    {value: 'nid', name: 'NID'},
    {value: 'foreName', name: 'first name'},
    {value: 'surname', name: 'last name'},
  ];
  isCwsOfficer = false;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orgId = params['organisationId'.toString()];
    });
    this.isCwsOfficer = this.authorisationService.isCWSUser();
    this.organisationService.get(this.orgId).subscribe(data => {
      this.org = data.content;
    });
    this.parameters = {
      length: 25,
      start: 0,
      draw: 1
    };
    this.organisationService.getOrgPendingFarmers(this.orgId, this.parameters)
      .subscribe(data => {
        if (!data.data) {
          this.config = {
            itemsPerPage: this.parameters.length,
            currentPage: this.parameters.start + 1,
            totalItems: 0
          };
       } else {
          this.farmers = data.data;
          this.config = {
            itemsPerPage: this.parameters.length,
            currentPage: this.parameters.start + 1,
            totalItems: data.recordsTotal
          };
        }
        this.showData = true;
      });
    this.filterForm = this.formBuilder.group({
      term: ['', Validators.minLength(3)],
      searchBy: ['foreName']
    });
    this.getAllPendingFarmers();
    this.message = this.messageService.getMessage();
  }

  onPageChange(event) {
    this.config.currentPage = event;
    if (event >= 1) {
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

  exportAsXLSX() {
    this.excelService.exportAsExcelFile(this.allPendingFarmers, 'farmers');
  }


  canApprove(missingInfo: any) {
    return this.isCwsOfficer || this.authorisationService.isDistrictCashCropOfficer();
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

  getAllPendingFarmers() {
    this.organisationService.getAllOrgPendingFarmers(this.orgId)
      .subscribe(data => {
        data.content.map((item) => {
          const temp = {
            NAMES: item.surname + '  ' + item.foreName,
            SEX: item.sex,
            NID: item.NID,
            PROVINCE: item.location.prov_id.namek,
            DISTRICT: item.location.dist_id.name,
            SECTOR: item.location.sect_id.name,
            CELL: item.location.cell_id.name,
            VILLAGE: item.location.village_id.name,
            SEASON: item.season.name,
            TREES: item.numberOfTrees,
            MISSING: item.reason.join(', ')
          };
          this.allPendingFarmers.push(temp);
        });
      });
  }
}
