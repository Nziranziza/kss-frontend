import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {BasicComponent, FarmService} from '../../../core';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-tree-variety',
  templateUrl: './tree-varieties-list.component.html',
  styleUrls: ['./tree-varieties-list.component.css']
})
export class TreeVarietiesListComponent extends BasicComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private farmService: FarmService) { super();
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
    this.getTreeVarieties();
  }

  getTreeVarieties() {
    this.farmService.listTreeVarieties().subscribe((data) => {
      this.varieties = data.content;
    });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
