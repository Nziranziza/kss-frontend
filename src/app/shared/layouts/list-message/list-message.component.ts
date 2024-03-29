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
  }

  ngOnChanges(changes: SimpleChanges) {
    document.querySelector('.home, .wrapper').scrollTo(0, 0);
    const msg = changes.message.currentValue;
    this.notEmpty = (msg !== '' && !isUndefined(msg));
    if (this.notEmpty) {
      $(() => {
        $('.custom-message').each((index, element) => {
          const $element = $(element);
          $element.show();
        });
      });
      $(() => {
        $('.custom-message').each((index, element) => {
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
