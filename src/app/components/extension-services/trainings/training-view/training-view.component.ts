import {
  Component,
  Injector,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Inject,
  Input,
  ViewChild,
} from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingService, GapService, Training } from '../../../../core';
import { MessageService } from '../../../../core';
import { BasicComponent } from '../../../../core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { isPlatformBrowser } from '@angular/common';
import { TrainingScheduleViewComponent } from '../../schedules/training-schedule-view/training-schedule-view.component';

@Component({
  selector: 'app-training-view',
  templateUrl: './training-view.component.html',
  styleUrls: ['../training-create/training-create.component.css'],
})
export class TrainingViewComponent
  extends BasicComponent
  implements OnInit, OnDestroy
{

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
    private trainingService: TrainingService,
    private messageService: MessageService,
    private modalService: NgbModal
  ) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }
  createTraining: UntypedFormGroup;
  closeResult = '';
  training: Training;
  modal: NgbActiveModal;
  @Input() id: string;

  results: any[] = [];
  gaps: any[] = [];
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
  trainingsStats: any;
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  // @ts-ignore
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  ngOnDestroy(): void {}

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    this.getTraining();
    this.getTrainingsStats();
    this.setMessage(this.messageService.getMessage());
  }

  getTraining() {
    this.trainingService.one(this.id).subscribe((data) => {
      if (data && data.data) {
        this.training = data.data;
      }
      this.config = {
        itemsPerPage: 10,
        currentPage: 1,
        totalItems: this.training.schedules.length,
      };
    });
  }

  getTrainingsStats(): void {
    this.loading = true;
    this.trainingService
      .getScheduleStats({
        trainingId: this.id,
      })
      .subscribe((data) => {
        this.trainingsStats = data.data;
        this.loading = false;
      });
  }

  openViewModal(id: string) {
    const modalRef = this.modalService.open(TrainingScheduleViewComponent);
    modalRef.componentInstance.id = id;
  }
}
