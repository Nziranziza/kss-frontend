import {AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {BasicComponent} from '../../../core/library';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {
  AuthenticationService,
  ConfirmDialogService, MessageService, OrganisationService,
  ParchmentService,
  SeasonService,
  WarehouseService
} from '../../../core/services';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {HelperService} from '../../../core/helpers';
import {Subject} from 'rxjs';
import {DataTableDirective} from 'angular-datatables';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

declare var $;

@Component({
  selector: 'app-parchment-list-transfers',
  templateUrl: './parchment-list-transfers.component.html',
  styleUrls: ['./parchment-list-transfers.component.css']
})

export class ParchmentListTransfersComponent extends BasicComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router, private confirmDialogService: ConfirmDialogService,
              private seasonService: SeasonService,
              private modal: NgbModal,
              private renderer: Renderer2,
              private organisationService: OrganisationService,
              private messageService: MessageService,
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
  @ViewChild('destination') destination: any;
  @ViewChild('expendableTable') expendableTable: ElementRef;
  season: any;
  seasonStartingDate: string;
  transfers = [];
  organisations = [];
  parameters: any;
  keyword = 'name';
  initialValue = '';
  summary: any;

  ngOnInit() {
    $(document).ready(() => {
      $('[data-toggle="tooltip"]').tooltip();
    });
    this.seasonStartingDate = this.datePipe.transform(this.authenticationService.getCurrentSeason().created_at, 'yyyy-MM-dd');
    this.currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      columns: [{}, {}, {}, {
        class: 'none'
      }, {}, {}],
      responsive: true
    };
    this.filterForm = this.formBuilder.group({
      type: [''],
      destination: [''],
      date: this.formBuilder.group({
        from: [this.seasonStartingDate],
        to: [this.currentDate]
      })
    });
    this.parameters = {
      org_id: this.authenticationService.getCurrentUser().info.org_id
    };
    this.setMessage(this.messageService.getMessage());
    this.getTransfers();
    const self = this;
    $('#responsive-table').on('click', 'a.cancel-item', function(e) {
      e.preventDefault();
      console.log($(this).attr('id'));
      self.cancelTransferItem($(this).attr('id'));
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
      this.getTransfers();
    }
  }

  selectEvent(item) {
    this.filterForm.controls.destination.setValue(item._id);
  }

  deselectEvent() {
    if (this.parameters.search && this.parameters.search.destination) {
      delete this.parameters.search.destination;
      this.filterForm.controls.destination.setValue('');
    }
  }

  onClearFilter() {
    this.filterForm.controls.destination.reset();
    this.filterForm.controls.type.setValue('');
    this.filterForm.controls.date.get('from').setValue(this.seasonStartingDate);
    this.filterForm.controls.date.get('to').setValue(this.currentDate);
    this.destination.clear();
    delete this.parameters.search;
    this.getTransfers();
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

  cancelTransfer(id: string) {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to cancel this transfer? ' +
      'action cannot be undone').afterClosed().subscribe(
      res => {
        if (res) {
          this.parchmentService.cancelTransfer(id).subscribe(() => {
            this.setMessage('Transfer successfully cancelled!');
            this.getTransfers();
          }, (err) => {
            this.setError(this.errors = err.errors);
            window.scroll(0, 0);
          });
        }
      });
  }

  checkOrg(org: any, list: any) {
    return list.some((el) => {
      return el._id === org._id;
    });
  }

  getTransfers() {
    this.parchmentService.getTransferHistory(this.parameters).subscribe((data) => {
      this.transfers = data.content;
      this.rerender();

      this.transfers.forEach((transfer) => {
        if (!this.checkOrg(transfer.destOrg, this.organisations)) {
          this.organisations.push(transfer.destOrg);
        }
      }, (err) => {
        if (err.status === 404) {
          this.setWarning('Sorry no matching data');
          this.transfers = [];
        }
      });
      this.parchmentService.getTransfersSummary(this.parameters).subscribe((dt) => {
        this.summary = dt.content;
      });
    });
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
      const el = this.expendableTable.nativeElement.querySelector('.expendable-dataTable .dtr-data .cancel');
      if (el) {
        el.addEventListener('click', () => {
          console.log('here1');
        });

        this.renderer.listen(el, 'click', () => {
          console.log('here2');
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.messageService.clearMessage();
  }

  cancelTransferItem(itemId: string) {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to cancel this transfer item? ' +
      'action cannot be undone').afterClosed().subscribe(
      res => {
        if (res) {
          this.parchmentService.cancelTransferItem(itemId).subscribe(() => {
            this.setMessage('Item successfully cancelled!');
            this.getTransfers();
          }, (err) => {
            this.setError(this.errors = err.errors);
            window.scroll(0, 0);
          });
        }
      });
  }
}
