import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, Injector, Input, OnInit, PLATFORM_ID,
  ViewChild, } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { BasicComponent, SeedlingService } from 'src/app/core';

@Component({
  selector: 'app-view-nursery',
  templateUrl: './view-nursery.component.html',
  styleUrls: [
    './view-nursery.component.css',
  ],
})
export class ViewNurseryComponent extends BasicComponent implements OnInit {
  modal: NgbActiveModal;
  @Input() id: string;
  config: any;
  dtOptions: any = {};
  loading = false;
  trainingsStats: any;
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  // @ts-ignore
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
    private seedlingService: SeedlingService,
  ) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }
  nurseryDatas: any;
  nurseryDistribution: any[] = [];

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    this.seedlingService.one(this.id).subscribe((data) => {
      const datas = data.data;
      this.nurseryDatas = datas;
    });
    this.seedlingService.getSeedlingDistributionByNursery({nurseryId: this.id}).subscribe((data) => {
      this.nurseryDistribution = data.data;
      this.config = {
        itemsPerPage: 10,
        currentPage: 1,
        totalItems: this.nurseryDistribution.length,
      };
    })
  }
}
