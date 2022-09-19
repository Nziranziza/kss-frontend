import {Directive, ElementRef, OnInit, Renderer2} from '@angular/core';
import {AuthenticationService} from '../../core';

@Directive({
  selector: '[appRequiredSeasonCherry]'
})
export class RequiredSeasonCherryDirective  implements OnInit {

  constructor(private el: ElementRef, private renderer: Renderer2, private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
      /*
      if (!this.authenticationService.getCurrentSeason().isCurrent &&
      this.authenticationService.getCurrentSeason().season !== '2021A&B') {
      */
      if (!this.authenticationService.getCurrentSeason().isCurrent) {
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    }
  }
}
