import {Component, Input, OnInit, OnChanges, SimpleChanges} from '@angular/core';
import {isArray, isUndefined} from 'util';

declare var $;

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

    if (this.notEmpty) {
      $(() => {
        $('.custom-error').each((index, element) => {
          const $element = $(element);
          $element.show();
        });
      });
      $(() => {
        $('.custom-error').each((index, element) => {
          const $element = $(element);
          const timeout = $element.data('auto-dismiss') || 7500;
          setTimeout(() => {
            $element.hide();
          }, timeout);
        });
      });
    }
  }
}
