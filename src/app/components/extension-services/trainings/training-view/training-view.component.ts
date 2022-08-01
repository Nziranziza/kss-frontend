import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TrainingService, GapService, Training } from "../../../../core";
import { MessageService } from "../../../../core";
import { BasicComponent } from "../../../../core";
import { Subject } from "rxjs";
import { DataTableDirective } from "angular-datatables";

@Component({
  selector: "app-training-view",
  templateUrl: "./training-view.component.html",
  styleUrls: ["../training-create/training-create.component.css"],
})
export class TrainingViewComponent
  extends BasicComponent
  implements OnInit, OnDestroy
{
  createTraining: FormGroup;
  closeResult = "";
  id: string;
  training: Training;
  constructor(
    private trainingService: TrainingService,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {
    super();
  }

  ngOnDestroy(): void {}

  results: any[] = [];
  gaps: any[] = [];
  maxSize = 5;
  directionLinks = true;
  showData = true;
  autoHide = false;
  responsive = false;
  labels: any = {
    previousLabel: "Prev",
    nextLabel: "Next",
    screenReaderPaginationLabel: "Pagination",
    screenReaderPageLabel: "page",
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

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.id = params["id".toString()];
    });
    this.dtOptions = {
      pagingType: "full_numbers",
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
        this.dtTrigger.next();
      }
      this.config = {
        itemsPerPage: 10,
        currentPage: 0 + 1,
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
        console.log(this.trainingsStats);
        this.loading = false;
      });
  }
}
