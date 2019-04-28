import {Directive, ElementRef, Input, OnInit, Renderer2} from '@angular/core';
import {AuthorisationService} from '../../core/services/authorisation.service';

@Directive({
  selector: '[appRequiredRoles]'
})
export class RequiredRolesDirective implements OnInit {

  @Input('appRequiredRoles') roles: any [];

  constructor(private el: ElementRef, private renderer: Renderer2, private authorisationService: AuthorisationService) {
  }

  ngOnInit() {
    if (!this.authorisationService.hasRoles(this.roles)) {
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    }
    this.authorisationService.clear();
  }
}
