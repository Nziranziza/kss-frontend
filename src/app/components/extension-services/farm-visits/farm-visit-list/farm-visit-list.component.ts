import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import {Subject} from 'rxjs';
import { MessageService, VisitService, Training, AuthenticationService, BasicComponent } from 'src/app/core';

@Component({
  selector: 'app-farm-visit-list',
  templateUrl: './farm-visit-list.component.html',
  styleUrls: ['../../gaps/gap-list/gap-list.component.css']
})
export class FarmVisitListComponent extends BasicComponent implements OnInit, OnDestroy {

  constructor(
    private messageService: MessageService,
    private visitService: VisitService, 
    private modal: NgbModal, 
    private authenticationService: AuthenticationService
  ) {
    super();
  }
  ngOnDestroy(): void {
  }

  visits: any[] = [];
  maxSize = 5;
  directionLinks = true;
  showData = true;
  autoHide = false;
  responsive = false;
  labels: any = {
    previousLabel: 'Prev',
    nextLabel: 'Next',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`,
  };
  config: any;
  dtOptions: any = {};
  loading = false;
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  // @ts-ignore
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  ngOnInit() {
    this.getVisits();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
    };
  }

  getVisits(): void {
    this.loading = true;
    this.visitService.all(this.authenticationService.getCurrentUser().info.org_id).subscribe((data) => {
      this.visits = data.data;
      console.log(data);
      this.dtTrigger.next();
      this.loading = false;
    });
    this.loading = false;
    this.config = {
      itemsPerPage: 10,
      currentPage: 0 + 1,
      totalItems: this.visits.length,
    };
  }
}