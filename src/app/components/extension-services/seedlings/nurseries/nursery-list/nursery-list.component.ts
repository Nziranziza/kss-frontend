import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DataTableDirective } from "angular-datatables";
import {
  AuthenticationService,
  MessageService,
  TrainingService,
  SeedlingService,
  BasicComponent,
} from "src/app/core";
import { Subject } from "rxjs";
import { ConfirmModalComponent } from "src/app/shared";

@Component({
  selector: "app-nursery-list",
  templateUrl: "./nursery-list.component.html",
  styleUrls: ["./nursery-list.component.css"],
})
export class NurseryListComponent
  extends BasicComponent
  implements OnInit, OnDestroy
{
  constructor(
    private messageService: MessageService,
    private trainingService: TrainingService,
    private authenticationService: AuthenticationService,
    private modalService: NgbModal,
    private seedlingService: SeedlingService
  ) {
    super();
  }
  ngOnDestroy(): void {}

  nurseries: any[] = [];
  schedule;
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
  totalSeeds: any[] = [];
  totalPrickedOut: any[] = [];
  prickedSum = 0;
  seedsSum = 0;
  totalDistributedSum: any[] = [];
  distributeSum = 0;
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  // @ts-ignore
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  ngOnInit() {
    this.getSchedules();
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 25,
    };
  }

  getSchedules(): void {
    this.loading = true;
    this.seedlingService.all().subscribe((data) => {
      this.nurseries = data.data;
      this.nurseries.map((nursery) => {
        let sum = 0;
        let prickedSum = 0;
        let distributedSum = 0;
        nursery.stocks.map((stock) => {
          let distributedSeed = stock.remainingQty
            ? stock.prickedQty - stock.remainingQty
            : 0;
          sum += stock.seeds;
          prickedSum += stock.prickedQty || 0;
          distributedSum += distributedSeed || 0;
        });
        this.totalSeeds.push(sum);
        this.totalDistributedSum.push(distributedSum);
        this.totalPrickedOut.push(prickedSum);
      });
      this.totalSeeds.map((total) => {
        this.seedsSum += total;
      });
      this.totalDistributedSum.map((distSum) => {
        this.distributeSum += distSum;
      });
      this.totalPrickedOut.map((total) => {
        this.prickedSum += total;
      });
      this.dtTrigger.next();
      this.loading = false;
    });

    this.config = {
      itemsPerPage: 10,
      currentPage: 0 + 1,
      totalItems: this.nurseries.length,
    };
  }

  openDeleteModal(group: any, warning?: any) {
    const modalRef = this.modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.title = "Delete Nursery";
    modalRef.componentInstance.content =
      "Are you sure you want to Delete this Nursery?";
    modalRef.componentInstance.confirmButtonText = "Delete";
    modalRef.componentInstance.cancelButtonText = "Cancel";
    modalRef.componentInstance.warning = warning;
    modalRef.result.then((results) => {
      if (results.confirmed) {
        this.seedlingService.delete(group._id).subscribe(
          () => {
            this.loading = true;
            const body = {
              reference:
                this.authenticationService.getCurrentUser().info.org_id,
            };

            this.getSchedules();
            this.setMessage("Nursery successfully Deleted!");
          },
          (err) => {
            this.openDeleteModal(group, err.message);
          }
        );
      }
    });
  }
}
