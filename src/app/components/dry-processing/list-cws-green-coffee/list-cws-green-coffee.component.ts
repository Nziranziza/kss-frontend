import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {
  AuthenticationService,
  BasicComponent,
  ConfirmDialogService,
  DryProcessingService,
  HelperService,
  MessageService,
  SeasonService
} from '../../../core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DatePipe} from '@angular/common';
import {Subject} from 'rxjs';
import {DataTableDirective} from 'angular-datatables';
import {ShowResultsComponent} from './show-results/show-results.component';

declare var $;

@Component({
  selector: 'app-list-cws-green-coffee',
  templateUrl: './list-cws-green-coffee.component.html',
  styleUrls: ['./list-cws-green-coffee.component.css']
})
export class ListCwsGreenCoffeeComponent extends BasicComponent implements OnInit, OnDestroy, AfterViewInit {

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
  @ViewChild('destination') destination: any;
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
    this.getGreenCoffeeList();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  selectEvent(item) {
    this.filterForm.controls.destination.setValue(item._id);
  }

  deselectEvent() {
    if (this.parameters.search && this.parameters.search.supplier) {
      delete this.parameters.search.supplier;
      this.filterForm.controls.destination.setValue('');
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
    this.filterForm.controls.destination.reset();
    this.filterForm.controls.date.get('from').setValue(this.seasonStartingDate);
    this.filterForm.controls.date.get('to').setValue(this.currentDate);
    delete this.parameters.search;
    this.getGreenCoffeeList();
  }


  getGreenCoffeeList() {
    this.dryProcessingService.getCWSGreenCoffee(this.parameters).subscribe((data) => {
      this.greenCoffees = data.content;
      this.rerender();
      this.loading = false;
      this.greenCoffees.forEach((coffee) => {
        if (!this.checkOrg(coffee.organization, this.organisations)) {
          this.organisations.push(coffee.organization);
        }
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

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  showResults(orgId: string, id: string) {
    const modalRef = this.modal.open(ShowResultsComponent, {size: 'sm'});
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.organisationId = orgId;
    modalRef.result.finally(() => {
      this.getGreenCoffeeList();
    });
  }
}
