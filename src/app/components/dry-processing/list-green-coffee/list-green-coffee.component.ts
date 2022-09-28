import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {
  AuthenticationService,
  ConfirmDialogService, DryProcessingService,
  MessageService,
  SeasonService,
} from '../../../core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DatePipe} from '@angular/common';
import {Subject} from 'rxjs';
import {BasicComponent} from '../../../core';
import {DataTableDirective} from 'angular-datatables';
import {AddCoffeeItemComponent} from '../prepare-green-coffee/add-coffee-item/add-coffee-item.component';
import {FormBuilder, FormGroup} from '@angular/forms';
import {HelperService} from '../../../core';
import {AddResultsComponent} from './add-results/add-results.component';

declare var $;

@Component({
  selector: 'app-list-green-coffee',
  templateUrl: './list-green-coffee.component.html',
  styleUrls: ['./list-green-coffee.component.css']
})
export class ListGreenCoffeeComponent extends BasicComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router, private confirmDialogService: ConfirmDialogService,
    private seasonService: SeasonService,
    private modal: NgbModal,
    private messageService: MessageService,
    private datePipe: DatePipe, private authenticationService: AuthenticationService,
    private dryProcessingService: DryProcessingService,
    private helper: HelperService
  ) {
    super();
  }

  dtOptions: any = {};
  loading = false;
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  // @ts-ignore
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  @ViewChild('supplier') supplier: any;
  greenCoffees = [];
  parameters: any;
  summary: any;
  results: any;
  orgId: string;
  filterForm: FormGroup;
  currentDate: any;
  seasonStartingDate: string;
  organisations = [];
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
      pageLength: 25,
      columns: [{}, {}, {}, {}, {}, {
        class: 'none'
      }, {}],
      responsive: true
    };
    this.orgId = this.authenticationService.getCurrentUser().info.org_id;
    this.filterForm = this.formBuilder.group({
      type: [''],
      supplier: [''],
      date: this.formBuilder.group({
        from: [this.seasonStartingDate],
        to: [this.currentDate]
      })
    });
    this.parameters = {
      org_id: this.authenticationService.getCurrentUser().info.org_id
    };
    this.setMessage(this.messageService.getMessage());
    this.getGreenCoffeeList();
    const self = this;
    $('#responsive-table').on('click', 'a.cancel-item', function(e) {
      const data = $(this).attr('id').split('-');
      e.preventDefault();
      self.cancelGreenCoffeeItem(data[0], data[1]);
    });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  selectEvent(item) {
    this.filterForm.controls.supplier.setValue(item._id);
  }

  deselectEvent() {
    if (this.parameters.search && this.parameters.search.supplier) {
      delete this.parameters.search.supplier;
      this.filterForm.controls.supplier.setValue('');
    }
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
      this.getGreenCoffeeList();
    }
  }

  onClearFilter() {
    this.filterForm.controls.supplier.reset();
    this.filterForm.controls.type.setValue('');
    this.filterForm.controls.date.get('from').setValue(this.seasonStartingDate);
    this.filterForm.controls.date.get('to').setValue(this.currentDate);
    delete this.parameters.search;
    this.getGreenCoffeeList();
  }


  cancelGreenCoffee(id: string) {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to cancel this mixture? ' +
      'action cannot be undone').afterClosed().subscribe(
      res => {
        if (res) {
          this.dryProcessingService.cancelGreenCoffee(id).subscribe(() => {
            this.setMessage('Mixture successfully cancelled!');
            this.getGreenCoffeeList();
          }, (err) => {
            this.setError(this.errors = err.errors);
            window.scroll(0, 0);
          });
        }
      });
  }

  getGreenCoffeeList() {
    this.dryProcessingService.getGreenCoffee(this.parameters).subscribe((data) => {
      this.greenCoffees = data.content;
      this.rerender();
      this.loading = false;
      this.greenCoffees.forEach((coffee) => {
        coffee.mixture.forEach((item) => {
          if (!this.checkOrg(item.supplier, this.organisations)) {
            this.organisations.push(item.supplier);
          }
        });
      });
    }, (err) => {
      if (err.status === 404) {
        this.setWarning('Sorry no matching data');
        this.greenCoffees = [];
      }
    });
    this.dryProcessingService.getGreenCoffeeStockSummary(this.parameters).subscribe((data) => {
      this.summary = data.content;
    });
    this.dryProcessingService.getGreenCoffeeResultSummary(this.parameters).subscribe((data) => {
      this.results = data.content;
    });

  }

  checkOrg(org: any, list: any) {
    return list.some((el) => {
      return el._id === org._id;
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.messageService.clearMessage();
  }

  cancelGreenCoffeeItem(coffeeId: string, itemId: string) {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to cancel this item? ' +
      'action cannot be undone').afterClosed().subscribe(
      res => {
        if (res) {
          this.dryProcessingService.cancelGreenCoffeeItem(itemId).subscribe(() => {
            this.setMessage('Item successfully cancelled!');
            this.getGreenCoffeeList();
          }, (err) => {
            this.setError(this.errors = err.errors);
            window.scroll(0, 0);
          });
        }
      });
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  addItem(id: string) {
    const data = {
      id,
    };
    const modalRef = this.modal.open(AddCoffeeItemComponent, {size: 'lg'});
    modalRef.componentInstance.data = data;
    modalRef.result.then((message) => {
      this.setMessage(message);
      this.getGreenCoffeeList();
    });
  }

  addResults(id: string) {
    const modalRef = this.modal.open(AddResultsComponent, {size: 'sm'});
    modalRef.componentInstance.id = id;
    modalRef.result.finally(() => {
      this.getGreenCoffeeList();
    });
  }
}

