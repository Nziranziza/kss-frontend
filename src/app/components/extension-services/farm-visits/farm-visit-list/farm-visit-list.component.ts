import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import {
  MessageService,
  VisitService,
  Training,
  AuthenticationService,
  BasicComponent,
} from "src/app/core";
import { ConfirmModalComponent } from "src/app/shared";
import { ViewFarmVisitComponent } from "../view-farm-visit/view-farm-visit.component";

@Component({
  selector: "app-farm-visit-list",
  templateUrl: "./farm-visit-list.component.html",
  styleUrls: ["../../gaps/gap-list/gap-list.component.css"],
})
export class FarmVisitListComponent
  extends BasicComponent
  implements OnInit, OnDestroy
{
  constructor(
    private messageService: MessageService,
    private visitService: VisitService,
    private modal: NgbModal,
    private authenticationService: AuthenticationService
  ) {
    super();
  }
  ngOnDestroy(): void {}

  visits: any[] = [];
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
  visit: any;
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  // @ts-ignore
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  ngOnInit() {
    this.getVisits();
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 25,
    };
  }

  getVisits(): void {
    this.loading = true;
    this.visitService
      .all(this.authenticationService.getCurrentUser().info.org_id)
      .subscribe((data) => {
        this.visits = data.data;
        console.log(this.visits);
        this.dtTrigger.next();
        this.loading = false;
      });
    this.loading = false;
    this.config = {
      itemsPerPage: 10,
      currentPage: 0 + 1,
      totalItems: this.visits.length,
    };
  }

  open(content) {
    this.modal.open(content, { size: "sm", windowClass: "modal-sm" });
  }

  selectedSchedule(visit) {
    this.visit = visit;
  }

  sendMessage() {
    this.loading = true;
    let data = this.visit._id;
    this.visitService.sendSms(data).subscribe((data) => {
      this.loading = false;
    });
  }

  openDeleteModal(visit: any, warning?: any) {
    const modalRef = this.modal.open(ConfirmModalComponent);
    modalRef.componentInstance.title = "Delete Farm Visit";
    modalRef.componentInstance.content =
      "Are you sure you want to Delete this Farm Visit?";
    modalRef.componentInstance.confirmButtonText = "Delete";
    modalRef.componentInstance.cancelButtonText = "Cancel";
    modalRef.componentInstance.warning = warning;
    modalRef.result.then((results) => {
      if (results.confirmed) {
        this.visitService.delete(visit._id).subscribe(
          () => {
            this.loading = true;
            const body = {
              reference:
                this.authenticationService.getCurrentUser().info.org_id,
            };

            this.getVisits();
            this.setMessage("Schedule successfully Cancelled!");
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
