import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FormControl} from '@angular/forms';

declare var $;

@Component({
  selector: 'app-inline-errors',
  templateUrl: './inline-errors.component.html',
  styleUrls: ['./inline-errors.component.css']
})
export class InlineErrorsComponent implements OnChanges {
  @Input()  errors: any;
  @Input()  label: string;
  notEmpty = false;
  errorsList = [];

  ngOnChanges(changes: SimpleChanges) {
    document.querySelector('.wrapper, .home').scrollTo(0, 0);
    this.errors = changes.errors.currentValue;
    this.errorsList = [];
    Object.keys(this.errors).forEach(keyError => {
        this.errorsList.push(this.label + ' is ' + keyError);
    });
    if (this.errorsList.length > 0) {
      this.notEmpty = true;
    }
    if (this.notEmpty) {
      $(() => {
        $('.inline-error').each((index, element) => {
          const $element = $(element);
          $element.show();
        });
      });
    } else {
      $(() => {
        $('.inline-error').each((index, element) => {
          const $element = $(element);
          const timeout = $element.data('auto-dismiss') || 3000;
          setTimeout(() => {
            $element.hide();
          }, timeout);
        });
      });
    }
  }
}
