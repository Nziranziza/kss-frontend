import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {BasicComponent} from '../../core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {
  AuthenticationService,
  ConfirmDialogService, OrganisationService,
  ParchmentService,
  SeasonService,
} from '../../core';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {HelperService} from '../../core';
import {Subject} from 'rxjs';
import {DataTableDirective} from 'angular-datatables';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EditDeliveryItemComponent} from './edit-delivery-item/edit-delivery-item.component';

declare var $;

@Component({
  selector: 'app-parchment-list-deliveries',
  templateUrl: './dm-parchment-list-deliveries.component.html',
  styleUrls: ['./dm-parchment-list-deliveries.component.css']
})

export class DmParchmentListDeliveriesComponent extends BasicComponent implements OnInit, AfterViewInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router, private confirmDialogService: ConfirmDialogService,
              private seasonService: SeasonService,
              private modal: NgbModal,
              private organisationService: OrganisationService,
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
  summary: any;
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
      columns: [{}, {}, {}, {}, { class: 'none'
      }, {}, {}],
      responsive: true
    };
    this.filterForm = this.formBuilder.group({
      type: [''],
      origin: [''],
      date: this.formBuilder.group({
        from: [this.seasonStartingDate],
        to: [this.currentDate]
      })
    });
    this.parameters = {
      org_id: this.authenticationService.getCurrentUser().info.org_id
    };
    this.getDeliveries();
    const self = this;
    $('#responsive-table').on('click', 'a.edit-parchment', function(e) {
      const data = $(this).attr('id').split('-');
      e.preventDefault();
      self.editParchment(data[0], data[1], data[2], data[3], data[4] );
    });
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
      this.getDeliveries();
    }
  }

  selectEvent(item) {
    this.filterForm.controls.origin.setValue(item._id);
  }

  deselectEvent() {
    if (this.parameters.search && this.parameters.search.origin) {
      delete this.parameters.search.origin;
      this.filterForm.controls.origin.setValue('');
    }
  }

  onClearFilter() {
    this.filterForm.controls.origin.reset();
    this.filterForm.controls.type.setValue('');
    this.filterForm.controls.date.get('from').setValue(this.seasonStartingDate);
    this.filterForm.controls.date.get('to').setValue(this.currentDate);
    this.origin.clear();
    delete this.parameters.search;
    this.getDeliveries();
  }

  confirmTransfer(deliveryId: string): void {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to confirm the deliveries? ' +
      'action cannot be undone').afterClosed().subscribe(
      res => {
        if (res) {
          const body = {
            deliveryId,
            userId: this.authenticationService.getCurrentUser().info._id,
            org_id: this.authenticationService.getCurrentUser().info.org_id
          };
          this.parchmentService.confirmDeliveries(body).subscribe(() => {
              this.setMessage('Deliveries successful confirmed!');
              this.getDeliveries();
            },
            (err) => {
              this.setError(err.errors);
            });
        }
    });
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

  getDeliveries() {
    this.parchmentService.getDeliveries(this.parameters).subscribe((data) => {
      this.transfers = data.content;
      this.transfers.forEach((transfer) => {
        if (!this.checkOrg(transfer.originOrg, this.organisations)) {
          this.organisations.push(transfer.originOrg);
        }
      });
      this.rerender();
    }, (err) => {
      if (err.status === 404) {
        this.setWarning('Sorry no matching data');
        this.transfers = [];
      }
    });
    this.parchmentService.getDeliveriesSummary(this.parameters).subscribe((data) => {
      this.summary = data.content;
    });
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  editParchment(transferId: string, itemId: string, parchmentId: string, quantity: number, lotNumber: string) {
    const payload = {
      transferId,
      itemId,
      parchmentId,
      quantity,
      lotNumber
    };
    const modalRef = this.modal.open(EditDeliveryItemComponent, {size: 'sm'});
    modalRef.componentInstance.payload = payload;
    modalRef.result.then((message) => {
      this.setMessage(message);
      this.getDeliveries();
    });
  }

  getRemaining(index: number) {
    return this.transfers[index].items.reduce((previous, current) => {
      return previous + current.remainingQty;
    }, 0);
  }
}
