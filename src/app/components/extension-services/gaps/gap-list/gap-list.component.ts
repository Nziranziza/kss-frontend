import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  BasicComponent,
  Gap,
  GapService,
  MessageService,
} from '../../../../core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GapDeleteModal } from '../gap-delete-modal/gap-delete-modal.component';

@Component({
  selector: 'app-gap-list',
  templateUrl: './gap-list.component.html',
  styleUrls: ['./gap-list.component.css'],
})
export class GapListComponent
  extends BasicComponent
  implements OnInit, OnDestroy {
  constructor(
    private messageService: MessageService,
    private gapService: GapService,
    private modal: NgbModal
  ) {
    super();
  }

  gaps: Gap[] = [];

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
    this.gapService.all().subscribe((data) => {
      this.gaps = data.data;
      this.loading = false;
    });

    this.config = {
      itemsPerPage: 10,
      currentPage: 0 + 1,
      totalItems: this.gaps.length,
    };
  }

  openDeleteModal(gap: Gap) {
    const modalRef = this.modal.open(GapDeleteModal);
    modalRef.componentInstance.gap = gap;
    modalRef.result.finally(() => {
      this.getGroups();
    });
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
