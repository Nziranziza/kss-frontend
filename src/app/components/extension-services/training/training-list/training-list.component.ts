import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TrainingService, Training } from "../../../../core";
import { MessageService } from "../../../../core";
// import { HelperService } from "../../../../core";
import { BasicComponent } from "../../../../core";
import {Subject} from 'rxjs';
import {DataTableDirective} from 'angular-datatables';
@Component({
  selector: 'app-training-list',
  templateUrl: './training-list.component.html',
  styleUrls: ['./training-list.component.css']
})
export class TrainingListComponent extends BasicComponent
implements OnInit, OnDestroy {

  constructor(
    private messageService: MessageService,
    private trainingService: TrainingService
  ) {
    super();
  }
  ngOnDestroy(): void {
  }

  trainings: Training[] = [];
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
    this.getGroups();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
    };
    this.setMessage(this.messageService.getMessage());
  }

  getGroups(): void {
    this.loading = true;
    this.trainingService.all().subscribe((data) => {
      this.trainings = data.data;
      this.loading = false;
    });

    this.config = {
      itemsPerPage: 10,
      currentPage: 0 + 1,
      totalItems: this.trainings.length,
    };
    
  }
  
}
