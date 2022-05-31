import {Directive, ElementRef, Input, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {AuthenticationService, AuthorisationService} from '../../core';

@Directive({
  selector: '[appHasServices]'
})

export class HasServicesDirective implements OnInit {

  @Input('appHasServices') services: string [];
  organisation: any;

  constructor(
    private element: ElementRef,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authenticationService: AuthenticationService,
    private authorisationService: AuthorisationService) {
  }

  ngOnInit() {
    if (!this.authorisationService.hasServices(this.services)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
