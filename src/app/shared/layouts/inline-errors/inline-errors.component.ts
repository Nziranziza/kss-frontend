import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { HelperService } from 'src/app/core';

declare var $;

@Component({
  selector: 'app-inline-errors',
  templateUrl: './inline-errors.component.html',
  styleUrls: ['./inline-errors.component.css'],
})
export class InlineErrorsComponent implements OnChanges {
  @Input() errors: any;
  @Input() label: string;
  notEmpty = false;
  errorsList = [];
  constructor(private helper: HelperService) {}
  ngOnChanges(changes: SimpleChanges) {
    document.querySelector('.wrapper, .home').scrollTo(0, 0);
    this.errors = changes.errors.currentValue;
    this.errorsList = [];
    Object.keys(this.errors).forEach((keyError) => {
      this.errorsList.push(
        this.helper.translateWord(this.label) +
          ' ' +
          this.helper.translateWord('is') +
          ' ' +
          this.helper.translateWord(keyError)
      );
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
          const timeout = $element.data('auto-dismiss') || 30000;
          setTimeout(() => {
            $element.hide();
          }, timeout);
        });
      });
    }
  }
}
