import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {
  AuthenticationService,
  ConfirmDialogService, DryProcessingService,
  MessageService,
  SeasonService,
} from '../../core/services';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DatePipe} from '@angular/common';
import {Subject} from 'rxjs';
import {BasicComponent} from '../../core/library';
import {DataTableDirective} from 'angular-datatables';
import {AddCoffeeItemComponent} from '../prepare-green-coffee/add-coffee-item/add-coffee-item.component';

declare var $;

@Component({
  selector: 'app-list-green-coffee',
  templateUrl: './list-green-coffee.component.html',
  styleUrls: ['./list-green-coffee.component.css']
})
export class ListGreenCoffeeComponent extends BasicComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(private router: Router, private confirmDialogService: ConfirmDialogService,
              private seasonService: SeasonService,
              private modal: NgbModal,
              private messageService: MessageService,
              private datePipe: DatePipe, private authenticationService: AuthenticationService,
              private dryProcessingService: DryProcessingService
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
  greenCoffees = [];
  summary: any;
  orgId: string;

  ngOnInit() {
    $(document).ready(() => {
      $('[data-toggle="tooltip"]').tooltip();
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
      columns: [{}, {}, {}, {
        class: 'none'
      }, {}],
      responsive: true
    };
    this.orgId = this.authenticationService.getCurrentUser().info.org_id;
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
    this.dryProcessingService.getGreenCoffee(this.orgId).subscribe((data) => {
      this.greenCoffees = data.content;
      this.rerender();
      this.loading = false;
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
}
