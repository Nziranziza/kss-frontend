import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  BasicComponent,
  MessageService,
  // OrganisationService,
  // SiteService
} from '../../../../core';
// import {ActivatedRoute, Router} from '@angular/router';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-gap-list',
  templateUrl: './gap-list.component.html',
  styleUrls: ['./gap-list.component.css'],
})
export class GapListComponent
  extends BasicComponent
  implements OnInit, OnDestroy {
  constructor(private messageService: MessageService) {
    super();
  }

  groups = [
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {}
  ];

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
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  ngOnInit() {
    this.getGroups();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
    };
    this.setMessage(this.messageService.getMessage());
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.messageService.clearMessage();
  }

  getGroups(): void {
    this.loading = true;
    this.config = {
      itemsPerPage: 10,
      currentPage: 0 + 1,
      totalItems: this.groups.length,
    };
  }

  onPageChange(event) {
    this.config.currentPage = event;
    if (event >= 1) {
      // this.parameters.start = (event - 1) * this.config.itemsPerPage;
    }

    // this.farmerService
    //   .getFarmers(this.parameters, this.as)
    //   .subscribe((data) => {
    //     this.farmers = data.data;
    //   });
  }
}
