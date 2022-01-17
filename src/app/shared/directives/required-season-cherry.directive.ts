import {Directive, ElementRef, OnInit, Renderer2} from '@angular/core';
import {AuthenticationService} from '../../core/services';

@Directive({
  selector: '[appRequiredSeasonCherry]'
})
export class RequiredSeasonCherryDirective  implements OnInit {

  constructor(private el: ElementRef, private renderer: Renderer2, private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    if (!this.authenticationService.getCurrentSeason().isCurrent &&
      this.authenticationService.getCurrentSeason().season !== '2021A&B') {
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    }
  }
}
