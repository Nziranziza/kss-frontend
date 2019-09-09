import {Directive, Input, ElementRef, TemplateRef, ViewContainerRef, OnInit} from '@angular/core';
import {AuthenticationService} from '../../core/services';
import {concatAll} from 'rxjs/operators';

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
    if (this.currentUser && this.currentUser.parameters.role) {
      for (const permission of this.permissions) {
        hasPermission = this.currentUser.parameters.role.includes(permission);
        if (hasPermission) {
          return hasPermission;
        }
      }
    }
    return hasPermission;
  }
}
