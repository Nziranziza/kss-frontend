import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import {
  MessageService,
  VisitService,
  AuthenticationService,
  BasicComponent,
} from 'src/app/core';
import { ConfirmModalComponent } from 'src/app/shared';
import { ViewFarmVisitComponent } from '../view-farm-visit/view-farm-visit.component';

@Component({
  selector: 'app-farm-visit-list',
  templateUrl: './farm-visit-list.component.html',
  styleUrls: ['../../gaps/gap-list/gap-list.component.css'],
})
export class FarmVisitListComponent
  extends BasicComponent
  implements OnInit, OnDestroy {
  constructor(
    private messageService: MessageService,
    private visitService: VisitService,
    private modal: NgbModal,
    private authenticationService: AuthenticationService
  ) {
    super();
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
  visit: any;
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  // @ts-ignore
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  ngOnDestroy(): void { }

  ngOnInit() {
    this.getVisits();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
    };
  }

  getVisits(deletetrigger = false): void {
    this.loading = true;
    this.visitService
      .all({reference: this.authenticationService.getCurrentUser().info.org_id})
      .subscribe((data) => {
        const newData = data.data.map((newdata) => {
          newdata.overall_score = 0;
          newdata.farms.map((farm) => {
            let overallWeight = 0;
            farm.evaluatedGaps.map((gap) => {
              overallWeight += gap.overall_weight;
            })
            farm.evaluatedGaps.map((gap) => {
              newdata.overall_score += gap.overall_score * 100 / overallWeight;
            })
          })
          newdata.overall_score = newdata.overall_score / newdata.gaps.length;
          const newFarmData = newdata.farms.filter((v, i, a) => a.findIndex(farm => (farm.owner.userId === v.owner.userId)) === i);
          newdata.farms = newFarmData;
          return newdata;
        });
        this.visits = newData;
        if (!deletetrigger) { this.dtTrigger.next() };
        this.loading = false;
      });
    this.loading = false;
    if (!deletetrigger) {
      this.config = {
        itemsPerPage: 10,
        currentPage: 1,
        totalItems: this.visits.length,
      };
    }
  }

  open(content) {
    this.modal.open(content, { size: 'sm', windowClass: 'modal-sm' });
  }

  selectedSchedule(visit) {
    this.visit = visit;
  }

  sendMessage() {
    this.loading = true;
    const data = this.visit._id;
    this.visitService.sendSms(data).subscribe(() => {
      this.loading = false;
    });
    this.loading = false;
  }

  openDeleteModal(visit: any, warning?: any) {
    const modalRef = this.modal.open(ConfirmModalComponent);
    modalRef.componentInstance.title = 'Delete Farm Visit';
    modalRef.componentInstance.content =
      'Are you sure you want to Delete this Farm Visit?';
    modalRef.componentInstance.confirmButtonText = 'Delete';
    modalRef.componentInstance.cancelButtonText = 'Cancel';
    modalRef.componentInstance.warning = warning;
    modalRef.result.then((results) => {
      if (results.confirmed) {
        this.visitService.delete(visit._id).subscribe(
          () => {
            this.getVisits(true);
            this.setMessage('Schedule successfully Cancelled!');
          },
          (err) => {
            this.openDeleteModal(visit, err.message);
          }
        );
      }
    });
  }

  openViewModal(id: string) {
    const modalRef = this.modal.open(ViewFarmVisitComponent);
    modalRef.componentInstance.id = id;
  }
}
