import {Directive, ElementRef, OnInit, Renderer2} from '@angular/core';
import {AuthenticationService} from '../../core/services';

@Directive({
  selector: '[appRequiredSeason]'
})
export class RequiredSeasonDirective  implements OnInit {

  constructor(private el: ElementRef, private renderer: Renderer2, private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    if (!this.authenticationService.getCurrentSeason().isCurrent) {
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    }
  }
}
