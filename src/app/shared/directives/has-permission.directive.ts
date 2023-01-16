import {Directive, Input, ElementRef, TemplateRef, ViewContainerRef, OnInit} from '@angular/core';
import {AuthenticationService} from '../../core';

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
    if (this.checkPermission(this.permissions)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  private checkPermission(permissions: any) {
    let isType = false;
    let hasRole = false;
    let hasPermission = false;
    if (this.currentUser && this.currentUser.parameters.role) {
      permissions.forEach((permission) => {
        if (!Array.isArray(permission)) {
          if (this.currentUser.parameters.role.includes(permission)) {
            hasPermission = true;
          }
        } else if (Array.isArray(permission[0])) {
          if (permission[2] === 'AND') {
            if (this.checkPermission([permission[0]]) || this.checkPermission([permission[1]])) {
              hasPermission = (this.checkPermission([permission[0]]) && this.checkPermission([permission[1]]));
            }
          }
          if (permission[2] === 'OR') {
            if (this.checkPermission([permission[0]]) || this.checkPermission([permission[1]])) {
              hasPermission = (this.checkPermission([permission[0]]) || this.checkPermission([permission[1]]));
            }
          }
          if (permission[2] === 'XOR') {
            if (this.checkPermission([permission[0]]) || this.checkPermission([permission[1]])) {
              hasPermission = (!(this.checkPermission([permission[0]]) && this.checkPermission([permission[1]])));
            }
          }
          if (permission[2] === 'NOT') {
            if (this.checkPermission([permission[0]]) || this.checkPermission([permission[1]])) {
              hasPermission = (this.checkPermission([permission[0]]) && (!this.checkPermission([permission[1]])));
            }
          }
        } else {
          hasRole = this.currentUser.parameters.role.includes(permission[0]) || permission[0] === 'all';
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
