import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VisitService, GapService, Training } from '../../../../core';
import { MessageService } from '../../../../core';
import { BasicComponent } from '../../../../core';

@Component({
  selector: 'app-view-farm-visit',
  templateUrl: './view-farm-visit.component.html',
  styleUrls: [
    '../../schedules/training-scheduling-create/training-scheduling-create.component.css',
  ],
})
export class ViewFarmVisitComponent
  extends BasicComponent
  implements OnInit, OnDestroy {
  createTraining: FormGroup;
  closeResult = '';
  visits: any;
  modal: NgbActiveModal;
  @Input() id: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
    private visitService: VisitService,
    private messageService: MessageService,
    private modalService: NgbModal
  ) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnDestroy(): void { }

  ngOnInit() {
    this.getVisits();
    this.setMessage(this.messageService.getMessage());
  }

  getVisits() {
    this.visitService.one(this.id).subscribe((data) => {
      data.data.farms.map((farm) => {
        let overallWeight = 0;
        farm.overall_score = 0;
        farm.evaluatedGaps.map((gap) => {
          overallWeight += gap.overall_weight;
        });
        farm.photos = [];
        farm.evaluatedGaps.map((gap) => {
          farm.overall_score += gap.overall_score * 100 / overallWeight;
          farm.photos.push(...gap.photos);
        })
        return farm
      })
      this.visits = data.data;
    });
  }
}
