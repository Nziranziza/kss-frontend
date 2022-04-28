import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {BasicComponent, FarmService} from '../../../core';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-trees-variety',
  templateUrl: './trees-variety-list.component.html',
  styleUrls: ['./trees-variety-list.component.css']
})
export class TreesVarietyListComponent extends BasicComponent implements OnInit, AfterViewInit, OnDestroy {

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
    this.getTreesVarieties();
  }

  getTreesVarieties() {
    this.farmService.listTreesVarieties().subscribe((data) => {
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
