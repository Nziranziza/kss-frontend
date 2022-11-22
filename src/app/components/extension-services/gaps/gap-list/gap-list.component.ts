import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  BasicComponent,
  Gap,
  GapService,
  MessageService,
} from '../../../../core';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GapDeleteModal } from '../gap-delete-modal/gap-delete-modal.component';
import { ViewGapComponent } from '../view-gap/view-gap.component';

@Component({
  selector: 'app-gap-list',
  templateUrl: './gap-list.component.html',
  styleUrls: ['./gap-list.component.css'],
})
export class GapListComponent
  extends BasicComponent
  implements OnInit {
  constructor(
    private messageService: MessageService,
    private gapService: GapService,
    private modal: NgbModal
  ) {
    super();
  }

  gaps: any[] = [];
  mostAdopted: any = '';
  overallWeight = 0;

  dtOptions: DataTables.Settings = {};
  loading = false;
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  ngOnInit() {
    this.getGap();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      order: [],
    };
    this.setMessage(this.messageService.getMessage());
  }


  getGap(deletetrigger: any = false): void {
    this.loading = true;
    this.gapService.all().subscribe((data) => {
      this.gaps = data.data;
      deletetrigger ? '' : this.dtTrigger.next();
      this.gaps.map((gap) => {
        this.overallWeight += gap.gap_weight * gap.adoptionRate / 100;
      })
      const bestAdopted = data.data.reduce((max, gap) => max.adoptionRate > gap.adoptionRate ? max : gap);
      if (bestAdopted.gap_name) {
        this.mostAdopted = bestAdopted.gap_name;
      }
      this.loading = false;
    });
  }

  openDeleteModal(gap: Gap) {
    const modalRef = this.modal.open(GapDeleteModal);
    modalRef.componentInstance.gap = gap;
    modalRef.result.finally(() => {
      this.getGap(true);
    });
  }

  openViewModal(id: string) {
    const modalRef = this.modal.open(ViewGapComponent);
    modalRef.componentInstance.id = id;
  }
}
