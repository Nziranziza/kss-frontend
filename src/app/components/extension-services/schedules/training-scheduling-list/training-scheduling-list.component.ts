import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  TrainingService,
  Training,
  AuthenticationService,
} from '../../../../core';
import { MessageService } from '../../../../core';
import { BasicComponent } from '../../../../core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from 'src/app/shared';
import { TrainingScheduleViewComponent } from '../training-schedule-view/training-schedule-view.component';

@Component({
  selector: 'app-training-scheduling-list',
  templateUrl: './training-scheduling-list.component.html',
  styleUrls: ['./training-scheduling-list.component.css'],
})
export class TrainingSchedulingListComponent
  extends BasicComponent
  implements OnInit, OnDestroy {
  constructor(
    private messageService: MessageService,
    private trainingService: TrainingService,
    private modal: NgbModal,
    private authenticationService: AuthenticationService,
    private modalService: NgbModal
  ) {
    super();
  }

  schedules: any[] = [];
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

  ngOnInit() {
    this.pageLoading = true;
    this.getSchedules();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
      order: [],
    };
    this.pageLoading = false;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.messageService.clearMessage();
  }

  getSchedules(deleteTrigger = false): void {
    this.loading = true;
    this.trainingService
      .allSchedule(this.authenticationService.getCurrentUser().info.org_id)
      .subscribe((data) => {
        this.schedules = data.data;
        deleteTrigger ? '' : this.dtTrigger.next();
      });
    if (!deleteTrigger) {
      this.config = {
        itemsPerPage: 10,
        currentPage: 0 + 1,
        totalItems: this.schedules.length,
      };
    }
    this.loading = false;
  }

  open(content) {
    this.modalService.open(content, { size: 'sm', windowClass: 'modal-sm' });
  }

  selectedSchedule(schedule) {
    this.schedule = schedule;
  }

  sendMessage() {
    this.loading = true;
    const data = this.schedule._id;
    this.trainingService.sendMessage(data).subscribe((data) => {
      this.loading = false;
    });
  }

  openDeleteModal(group: any, warning?: any) {
    const modalRef = this.modal.open(ConfirmModalComponent);
    modalRef.componentInstance.title = 'Delete Training Schedule';
    modalRef.componentInstance.content =
      'Are you sure you want to Delete this Schedule?';
    modalRef.componentInstance.confirmButtonText = 'Delete';
    modalRef.componentInstance.cancelButtonText = 'Cancel';
    modalRef.componentInstance.warning = warning;
    modalRef.result.then((results) => {
      if (results.confirmed) {
        this.trainingService.deleteSchedule(group._id).subscribe(
          () => {
            this.loading = true;
            this.getSchedules(true);
            this.setMessage('Schedule successfully Deleted!');
          },
          (err) => {
            this.openDeleteModal(group, err.message);
          }
        );
      }
    });
  }

  openViewModal(id: string) {
    const modalRef = this.modal.open(TrainingScheduleViewComponent);
    modalRef.componentInstance.id = id;
  }
}
