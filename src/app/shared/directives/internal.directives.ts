import {Directive, ElementRef, OnInit, Renderer2} from '@angular/core';
import { environment } from '../../../environments/environment';

@Directive({
  selector: '[appInternal]'
})
export class InternalDirective  implements OnInit {

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

  ngOnInit() {
    if (!(environment.production && environment.api_url === 'https://smartkungahara.rw/api')) {
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    }
  }
}
