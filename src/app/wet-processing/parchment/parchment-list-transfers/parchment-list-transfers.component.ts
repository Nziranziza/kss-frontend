import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {BasicComponent} from '../../../core/library';
import {FormBuilder, FormGroup} from '@angular/forms';
import {
  AuthenticationService,
  ConfirmDialogService,
  ParchmentService,
  SeasonService,
  WarehouseService
} from '../../../core/services';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {HelperService} from '../../../core/helpers';
import {Subject} from 'rxjs';
import {DataTableDirective} from 'angular-datatables';
import {ConfirmDispatchComponent} from '../../../input-distribution/site-view-dispatch/confirm-dispatch/confirm-dispatch.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ConfirmParchmentTransferComponent} from './confirm-parchment-transfer/confirm-parchment-transfer.component';

declare var $;

@Component({
  selector: 'app-parchment-list-transfers',
  templateUrl: './parchment-list-transfers.component.html',
  styleUrls: ['./parchment-list-transfers.component.css']
})

export class ParchmentListTransfersComponent extends BasicComponent implements OnInit, AfterViewInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router, private confirmDialogService: ConfirmDialogService,
              private seasonService: SeasonService,
              private modal: NgbModal,
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
  data = [];

  // @ts-ignore
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  season: any;
  seasonStartingDate: string;
  initialSearchValue: any;
  transfers = [];
  parameters: any;
  keyword = 'name';

  ngOnInit() {
    $(document).ready(() => {
      $('[data-toggle="tooltip"]').tooltip();
    });
    this.currentDate = new Date();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      columns: [{}, {}, {}, {}, {
        class: 'none'
      }, {}, {}, {}, {}],
      responsive: true
    };

    this.data = [
      {
        id: 1,
        name: 'Usa'
      },
      {
        id: 2,
        name: 'England'
      }
    ];
    this.filterForm = this.formBuilder.group({
      type: [''],
      grade: [''],
      date: this.formBuilder.group({
        from: [this.seasonStartingDate],
        to: [this.currentDate]
      })
    });
    this.initialSearchValue = this.filterForm.value;
    this.transfers = [{
      _id: '',
      totalAmountToTransfer: 1800,
      items: [
        {
          totalKgs: 1800,
          parchments: [
            {
              parchmentId: {
                lotNumber: '201102/PFW/1015'
              },
              amountToTransfer: 1800
            }
          ],
          type: {
            name: 'Full washed'
          },
          grade: 'A'
        }
      ],
      destOrgId: {
        organizationName: 'RWACOF DM'
      },
      sourceOrgId: {
        organizationName: 'Nkara Dukunde Kawa'
      },
      transferType: 'Sold'
    }];
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
      this.parchmentService.getTransferHistory(filter).subscribe((data) => {
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
    console.log(item);
    // do something with selected item
  }

  onChangeSearch(val: string) {
    console.log(val);
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onClearFilter() {
    this.filterForm.reset();
    this.filterForm.controls.search.get('searchBy').setValue('no_filter');
    this.parchmentService.getTransferHistory(this.parameters).subscribe((data) => {
      this.transfers = data.content;
      this.rerender();
    });
  }

  confirmTransfer(transfer): void {
    const modalRef = this.modal.open(ConfirmParchmentTransferComponent, {size: 'sm'});
    modalRef.componentInstance.transfer = transfer;
    modalRef.result.then((message) => {
      this.getTransfers();
      this.setMessage(message);
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

  cancelTransfer(id: string) {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to cancel the transfer? ' +
      'action cannot be undone').afterClosed().subscribe(
      res => {
        if (res) {
          const body = {
            id
          };
          this.parchmentService.cancelTransfer(body).subscribe(() => {
            this.setMessage('Transfer successfully cancelled!');
          }, (err) => {
            this.setError(this.errors = err.errors);
            window.scroll(0, 0);
          });
        }
      });
  }

  getTransfers() {
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
}
