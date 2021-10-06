import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {isArray, isUndefined} from 'util';

declare var $;

@Component({
  selector: 'app-list-warnings',
  templateUrl: './list-warnings.component.html',
  styleUrls: ['./list-warnings.component.css']
})
export class ListWarningsComponent implements OnInit, OnChanges {

  @Input() warning: string;
  isArray = false;
  notEmpty = false;

  constructor() {
  }

  ngOnInit() {
    this.isArray = isArray(this.warning);
  }

  ngOnChanges(changes: SimpleChanges) {
    const warning = changes.warning.currentValue;
    this.isArray = isArray(warning);
    if (this.isArray) {
      while (isArray(this.warning[0])) {
        this.warning = this.warning[0];
      }
    }
    if (this.isArray && warning.length > 0) {
      this.notEmpty = true;
    } else {
      this.notEmpty = (warning !== '' && !isUndefined(warning));
    }

    if (this.notEmpty) {
      $(() => {
        $('.custom-warning').each((index, element) => {
          const $element = $(element);
          $element.show();
        });
      });
      $(() => {
        $('.custom-warning').each((index, element) => {
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
