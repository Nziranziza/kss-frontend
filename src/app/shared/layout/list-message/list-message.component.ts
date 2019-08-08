import {Component, Input, OnInit} from '@angular/core';

declare var $;

@Component({
  selector: 'app-list-message',
  templateUrl: './list-message.component.html',
  styleUrls: ['./list-message.component.css']
})
export class ListMessageComponent implements OnInit {

  @Input() message: string;

  constructor() {
  }

  ngOnInit() {

    $(() => {
      $('.custom-message').each((index, element) => {
        const $element = $(element);
        const timeout = $element.data('auto-dismiss') || 5000;
        setTimeout(() => {
          $element.alert('close');
        }, timeout);
      });
    });
  }
}
