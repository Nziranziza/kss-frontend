import { ReportService } from './../../../../core/services/extension-services/report.service';
import {
  Component,
  Injector,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Inject,
  Input,
} from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TrainingService } from '../../../../core';
import { MessageService } from '../../../../core';
import { BasicComponent } from '../../../../core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-training-schedule-view',
  templateUrl: './training-schedule-view.component.html',
  styleUrls: ['./training-schedule-view.component.css'],
})
export class TrainingScheduleViewComponent
  extends BasicComponent
  implements OnInit, OnDestroy {

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
    private trainingService: TrainingService,
    private messageService: MessageService,
    private modalService: NgbModal,
    private reportService: ReportService
  ) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }
  closeResult = '';
  training: any;
  modal: NgbActiveModal;
  @Input() id: string;

  results: any[] = [];
  gaps: any[] = [];
  loading = false;
  dataReturned: any[] = [];
  trainingsStats: any = {
    male: 0,
    female: 0,
    total: 0,
    presence: {
      male: 0,
      female: 0,
      total: 0,
    },
    absence: {
      male: 0,
      female: 0,
      total: 0
    }
  };

  ngOnDestroy(): void { }

  ngOnInit() {
    this.getTraining();
    this.getTrainingsStats();
    this.setMessage(this.messageService.getMessage());
  }

  getTraining() {
    this.trainingService.getSchedule(this.id).subscribe((data) => {
      this.training = data.data;
    });
  }

  getTrainingsStats(): void {
    this.loading = true;
    this.reportService.trainingStats({
      scheduleId: this.id
    })
    .subscribe((data) => {
      this.trainingsStats = data.data;
      this.loading = false;
    });
  }

  open(content) {
    this.modalService.open(content, { size: 'sm', windowClass: 'modal-sm' });
  }

  sendMessage() {
    this.loading = true;
    const data = this.id;
    this.trainingService.sendMessage(data).subscribe((data) => {
      this.loading = false;
    });
  }
}
