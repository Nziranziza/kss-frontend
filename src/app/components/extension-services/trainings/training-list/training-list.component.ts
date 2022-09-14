import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import {
  TrainingService,
  Training,
  AuthenticationService,
} from "../../../../core";
import { MessageService } from "../../../../core";
// import { HelperService } from "../../../../core";
import { BasicComponent } from "../../../../core";
import { Subject } from "rxjs";
import { DataTableDirective } from "angular-datatables";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmModalComponent } from "../../../../shared";
import { TrainingViewComponent } from "../training-view/training-view.component";

@Component({
  selector: "app-training-list",
  templateUrl: "./training-list.component.html",
  styleUrls: ["./training-list.component.css"],
})
export class TrainingListComponent
  extends BasicComponent
  implements OnInit, OnDestroy
{
  constructor(
    private messageService: MessageService,
    private trainingService: TrainingService,
    private modal: NgbModal,
    private authenticationService: AuthenticationService
  ) {
    super();
  }

  trainings: Training[] = [];
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
    this.getTrainingList();
    this.getTrainingsStats({});
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
    };
    this.setMessage(this.messageService.getMessage());
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.messageService.clearMessage();
  }

  getTrainingList(): void {
    this.loading = true;
    this.trainingService.all().subscribe((data) => {
      this.trainings = data.data;
      this.loading = false;
      this.dtTrigger.next();
    });
    this.config = {
      itemsPerPage: 10,
      currentPage: 0 + 1,
      totalItems: this.trainings.length,
    };
  }

  getTrainingsStats(body: any): void {
    this.loading = true;
    this.trainingService.getScheduleStats(body).subscribe((data) => {
      this.trainingsStats = data.data;
      this.loading = false;
    });
  }

  openDeleteModal(trainingId: any, warning?: any) {
    const modalRef = this.modal.open(ConfirmModalComponent);
    modalRef.componentInstance.title = "Delete Training";
    modalRef.componentInstance.content =
      "Are you sure you want to delete this Training?";
    modalRef.componentInstance.confirmButtonText = "Delete";
    modalRef.componentInstance.cancelButtonText = "Cancel";
    modalRef.componentInstance.warning = warning;
    modalRef.result.then((results) => {
      if (results.confirmed) {
        this.trainingService.delete(trainingId).subscribe(
          () => {
            this.loading = true;
            const body = {
              reference:
                this.authenticationService.getCurrentUser().info.org_id,
            };

            this.getTrainingList();
            this.setMessage("Training successfully deleted!");
          },
          (err) => {
            this.setMessage(err.errors);
          }
        );
      }
    });
  }

  openViewModal(id: string) {
    const modalRef = this.modal.open(TrainingViewComponent);
    modalRef.componentInstance.id = id;
  }
}
