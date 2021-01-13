import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {isUndefined} from 'util';

declare var $;

@Component({
  selector: 'app-list-warnings',
  templateUrl: './list-warnings.component.html',
  styleUrls: ['./list-warnings.component.css']
})
export class ListWarningsComponent implements OnInit, OnChanges {

  @Input() warning: string;
  notEmpty = false;

  constructor() {
  }

  ngOnInit() {

    $(() => {
      $('.custom-message').each((index, element) => {
        const $element = $(element);
        const timeout = $element.data('auto-dismiss') || 7500;
        setTimeout(() => {
          $element.alert('close');
        }, timeout);
      });
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const warn = changes.warning.currentValue;
    this.notEmpty = (warn !== '' && !isUndefined(warn));
  }
}
