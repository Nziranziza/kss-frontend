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
    let hasPermission = false;
    let isType = false;
    let hasRole = false;
    if (this.currentUser && this.currentUser.parameters.role) {
      for (const permission of this.permissions) {
        if (!Array.isArray(permission)) {
          hasPermission = this.currentUser.parameters.role.includes(permission);
          if (hasPermission) {
            return hasPermission;
          }
        } else {
          hasRole = this.currentUser.parameters.role.includes(permission[0]);
          isType = + this.currentUser.parameters.type === permission[1];
          if (hasRole && isType) {
            hasPermission = true;
            return hasPermission;
          }
        }
      }
    }
    return hasPermission;
  }
}
