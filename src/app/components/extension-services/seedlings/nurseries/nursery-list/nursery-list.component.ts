import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import {
  AuthenticationService,
  MessageService,
  TrainingService,
  SeedlingService,
  BasicComponent,
  AuthorisationService,
} from 'src/app/core';
import { Subject } from 'rxjs';
import { ConfirmModalComponent } from 'src/app/shared';
import { ViewNurseryComponent } from '../view-nursery/view-nursery.component';

interface Stats {
  sites: number;
  remainingQty: number;
  expectedQty: number;
  prickedQty: number;
  providedQty: number;
  distributedQty: number;
  germinationRate: number
}

@Component({
  selector: 'app-nursery-list',
  templateUrl: './nursery-list.component.html',
  styleUrls: ['./nursery-list.component.css'],
})
export class NurseryListComponent
  extends BasicComponent
  implements OnInit, OnDestroy {
  constructor(
    private messageService: MessageService,
    private trainingService: TrainingService,
    private authenticationService: AuthenticationService,
    private modalService: NgbModal,
    private seedlingService: SeedlingService,
    private authorisationService: AuthorisationService
  ) {
    super();
  }

  nurseries: any[] = [];
  schedule;
  maxSize = 5;
  directionLinks = true;
  showData = true;
  autoHide = false;
  responsive = false;
  pageLoading = false;
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
  stats: Stats = {
    sites:0,
    remainingQty: 0,
    expectedQty: 0,
    prickedQty: 0,
    providedQty: 0,
    distributedQty: 0,
    germinationRate: 0
  }

  ngOnInit() {
    this.pageLoading = true;
    this.getNurseries();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
      order: [],
    };
    this.pageLoading = false;
  }

  ngOnDestroy(): void { }

  getNurseries(deletetrigger: any = false): void {
    this.loading = true;
    const body = !this.authorisationService.isTechnoServeAdmin() ?
      this.authenticationService.getCurrentUser().info.org_id : '';
    this.seedlingService.all(body).subscribe((data) => {
      this.nurseries = data.data.map((nursery) => {
        const prickedQty = nursery.stocks.reduce(
          (acc, curr) => acc + (curr.prickedQty || 0),
          0
        );
        const remainingQty = nursery.stocks.reduce(
          (acc, curr) => acc + (curr.remainingQty || 0),
          0
        );
        const distributedQty = prickedQty - remainingQty;
        return {
          ...nursery,
          stockQty: nursery.stocks.reduce(
            (acc, curr) => acc + (curr.seeds || 0),
            0
          ),
          prickedQty,
          distributedQty,
        };
      });
      deletetrigger ? ' ' : this.dtTrigger.next();
      this.loading = false;
    });
    this.seedlingService.nurseryStats(body).subscribe(({ data }) => {
      this.stats = data
    })
    if (!deletetrigger) {
      this.config = {
        itemsPerPage: 10,
        currentPage: 0 + 1,
        totalItems: this.nurseries.length,
      };
    }
  }

  openDeleteModal(nursery: any, warning?: any) {
    const modalRef = this.modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.title = 'Delete Nursery';
    modalRef.componentInstance.content =
      'Are you sure you want to Delete this Nursery?';
    modalRef.componentInstance.confirmButtonText = 'Delete';
    modalRef.componentInstance.cancelButtonText = 'Cancel';
    modalRef.componentInstance.warning = warning;
    modalRef.result.then((results) => {
      if (results.confirmed) {
        this.seedlingService.delete(nursery._id).subscribe(
          () => {
            this.loading = true;
            this.getNurseries(true);
            this.setMessage('Nursery successfully Deleted!');
          },
          (err) => {
            this.errors = err.errors;
          }
        );
      }
    });
  }

  openViewModal(id: string) {
    const modalRef = this.modalService.open(ViewNurseryComponent);
    modalRef.componentInstance.id = id;
  }
}
