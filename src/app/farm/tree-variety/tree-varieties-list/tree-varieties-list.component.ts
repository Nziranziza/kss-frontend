import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {BasicComponent, ConfirmDialogService, FarmService, MessageService} from '../../../core';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-tree-variety',
  templateUrl: './tree-varieties-list.component.html',
  styleUrls: ['./tree-varieties-list.component.css']
})
export class TreeVarietiesListComponent extends BasicComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private farmService: FarmService,
              private  confirmDialogService: ConfirmDialogService,
              private messageService: MessageService) {
    super();
  }

  varieties: any;
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
    this.setMessage(this.messageService.getMessage());
    this.getTreeVarieties();
  }

  getTreeVarieties() {
    this.farmService.listTreeVarieties().subscribe((data) => {
      this.varieties = data.data;
    });
  }

  deleteVariety(id: string): void {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to delete this variety?').afterClosed().subscribe(
      res => {
        if (res) {
          const body = {
            id
          };
        }
      });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.messageService.clearMessage();
  }
}
