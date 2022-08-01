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

  open(content) {
    this.modalService.open(content, { size: "sm", windowClass: "modal-sm" });
  }

  selectedSchedule(schedule) {
    this.schedule = schedule;
  }

  sendMessage() {
    this.loading = true;
    console.log(this.schedule);
    let data = this.schedule._id;
    console.log(data);
    this.trainingService.sendMessage(data).subscribe((data) => {
      this.loading = false;
    });
  }
}
