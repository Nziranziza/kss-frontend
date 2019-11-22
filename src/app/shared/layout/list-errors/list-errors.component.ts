import {Component, Input, OnInit, OnChanges, SimpleChanges} from '@angular/core';
import {isArray, isUndefined} from 'util';


@Component({
  selector: 'app-list-errors',
  templateUrl: './list-errors.component.html',
  styleUrls: ['./list-errors.component.css']
})
export class ListErrorsComponent implements OnInit, OnChanges {
  @Input() errorList: any;
  isArray = false;
  notEmpty = false;

  ngOnInit() {
    this.isArray = isArray(this.errorList);
  }

  ngOnChanges(changes: SimpleChanges) {
    const errors = changes.errorList.currentValue;
    this.isArray = isArray(errors);
    if (this.isArray) {
      while (isArray(this.errorList[0])) {
        this.errorList = this.errorList[0];
      }
    }
    if (this.isArray && errors.length > 0) {
      this.notEmpty = true;
    } else {
      this.notEmpty = (errors !== '' && !isUndefined(errors));
    }
  }
}
