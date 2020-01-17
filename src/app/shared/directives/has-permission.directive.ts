import {Directive, Input, ElementRef, TemplateRef, ViewContainerRef, OnInit} from '@angular/core';
import {AuthenticationService} from '../../core/services';

@Directive({
  selector: '[appHasPermission]'
})
export class HasPermissionDirective implements OnInit {

  constructor(
    private element: ElementRef,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authenticationService: AuthenticationService) {
  }

  private currentUser;

  @Input('appHasPermission') permissions: any;

  ngOnInit() {
    this.currentUser = this.authenticationService.getCurrentUser();
    this.updateView();
  }

  private updateView() {
    if (this.checkPermission()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  private checkPermission() {
    let isType = false;
    let hasRole = false;
    let hasPermission = false;
    if (this.currentUser && this.currentUser.parameters.role) {
      this.permissions.forEach((permission) => {
        if (!Array.isArray(permission)) {
          if (this.currentUser.parameters.role.includes(permission)) {
            hasPermission = true;
          }
        } else {
          hasRole = this.currentUser.parameters.role.includes(permission[0]);
          isType = +this.currentUser.parameters.type === permission[1];
          if (hasRole && isType) {
            hasPermission = true;
          }
        }
      });
    }
    return hasPermission;
  }
}
