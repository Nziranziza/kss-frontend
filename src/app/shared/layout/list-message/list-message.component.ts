import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {isUndefined} from 'util';

declare var $;

@Component({
  selector: 'app-list-message',
  templateUrl: './list-message.component.html',
  styleUrls: ['./list-message.component.css']
})
export class ListMessageComponent implements OnInit, OnChanges {

  @Input() message: string;
  notEmpty = false;

  constructor() {
  }

  ngOnInit() {

    $(() => {
      $('.custom-message').each((index, element) => {
        const $element = $(element);
        const timeout = $element.data('auto-dismiss') || 3000;
        setTimeout(() => {
          $element.alert('close');
        }, timeout);
      });
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const msg = changes.message.currentValue;
    this.notEmpty = (msg !== '' && !isUndefined(msg));
  }
}
