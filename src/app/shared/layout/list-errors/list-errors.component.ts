import {Component, Input, OnInit} from '@angular/core';
import {isArray} from 'util';


@Component({
  selector: 'app-list-errors',
  templateUrl: './list-errors.component.html',
  styleUrls: ['./list-errors.component.css']
})
export class ListErrorsComponent implements OnInit {
  @Input() errorList: any;
  isArray = false;

  ngOnInit() {
    this.isArray = isArray(this.errorList);
  }
}
