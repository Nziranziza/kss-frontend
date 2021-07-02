import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {BasicComponent} from '../../core/library';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {
  AuthenticationService,
  ConfirmDialogService, OrganisationService,
  ParchmentService,
  SeasonService,
  WarehouseService
} from '../../core/services';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {HelperService} from '../../core/helpers';
import {Subject} from 'rxjs';
import {DataTableDirective} from 'angular-datatables';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

declare var $;

@Component({
  selector: 'app-parchment-list-transfers',
  templateUrl: './dm-parchment-list-transfers.component.html',
  styleUrls: ['./dm-parchment-list-transfers.component.css']
})

export class DmParchmentListTransfersComponent extends BasicComponent implements OnInit, AfterViewInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router, private confirmDialogService: ConfirmDialogService,
              private seasonService: SeasonService,
              private modal: NgbModal,
              private organisationService: OrganisationService,
              private wareHouseService: WarehouseService,
              private datePipe: DatePipe, private authenticationService: AuthenticationService,
              private parchmentService: ParchmentService,
              private helper: HelperService) {
    super();
  }

  filterForm: FormGroup;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  loading = false;
  currentDate: any;
  // @ts-ignore
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  @ViewChild('origin')  origin: any;
  season: any;
  seasonStartingDate: string;
  transfers = [];
  organisations = [];
  parameters: any;
  keyword = 'name';
  initialValue = '';

  ngOnInit() {
    $(document).ready(() => {
      $('[data-toggle="tooltip"]').tooltip();
    });
    this.seasonStartingDate = this.datePipe.transform(this.authenticationService.getCurrentSeason().created_at, 'yyyy-MM-dd');
    this.currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      columns: [{}, {}, {}, { class: 'none'
      }, {}, {}, {}],
      responsive: true
    };
    this.filterForm = this.formBuilder.group({
      origin: ['', Validators.required],
      date: this.formBuilder.group({
        from: [this.seasonStartingDate],
        to: [this.currentDate]
      })
    });
    this.parameters = {
      org_id: this.authenticationService.getCurrentUser().info.org_id
    };
    this.organisationService.getOrgsByRoles({roles: [1]} ).subscribe(data => {
      if (data) {
        this.organisations = data.content;
      }
    });
    this.getTransfers();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  onFilter() {
    if (this.filterForm.valid) {
      const filter = JSON.parse(JSON.stringify(this.filterForm.value));
      if ((!filter.date.from) || (!filter.date.to)) {
        delete filter.date;
      } else {
        filter.date.from = this.helper.getDate(this.filterForm.value.date.from);
        filter.date.to = this.helper.getDate(this.filterForm.value.date.to);
      }
      this.helper.cleanObject(filter);
      this.parameters['search'.toString()] = filter;
      this.parchmentService.getTransferHistory(this.parameters).subscribe((data) => {
        this.transfers = data.content;
        this.rerender();
      }, (err) => {
        if (err.status === 404) {
          this.setWarning('Sorry no matching data');
          this.transfers = [];
        }
      });
    }
  }

  selectEvent(item) {
    this.filterForm.controls.origin.setValue(item._id);
  }

  onClearFilter() {
    this.filterForm.controls.origin.reset();
    this.filterForm.controls.date.get('from').setValue(this.seasonStartingDate);
    this.filterForm.controls.date.get('to').setValue(this.currentDate);
    this.origin.clear();
    delete this.parameters.search;
    this.getTransfers();
    this.parchmentService.getDeliveries(this.parameters).subscribe((data) => {
      this.transfers = data.content;
      this.rerender();
    });
  }

  confirmTransfer(transferId: string): void {
  }

  printNote(id: string) {
    this.clear();
    this.parchmentService.printDeliveryNote(id).subscribe((data) => {
      const byteArray = new Uint8Array(atob(data.data).split('').map(char => char.charCodeAt(0)));
      const newBlob = new Blob([byteArray], {type: 'application/pdf'});
      const linkElement = document.createElement('a');
      const url = URL.createObjectURL(newBlob);
      linkElement.setAttribute('href', url);
      linkElement.setAttribute('download', data.fileName + '.pdf');
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false
      });
      linkElement.dispatchEvent(clickEvent);
    });
  }

  getCurrentSeason() {
    this.seasonService.all().subscribe((dt) => {
      const seasons = dt.content;
      seasons.forEach((item) => {
        if (item.isCurrent) {
          this.season = item;
        }
      });
    });
  }

  checkOrg(org: any, list: any) {
    return list.some((el) => {
      return el._id === org._id;
    });
  }

  getTransfers() {
    this.parchmentService.getDeliveries(this.parameters).subscribe((data) => {
      this.transfers = data.content;
      this.transfers.forEach((transfer) => {
        if (!this.checkOrg(transfer.originOrg, this.organisations)) {
          this.organisations.push(transfer.originOrg);
        }
      });
      this.rerender();
    });
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
}
