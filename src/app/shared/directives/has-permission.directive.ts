import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { UserRole } from '../../features/auth/models/user.model';

/**
 * Directive to conditionally show UI elements based on user roles/permissions
 *
 * Usage examples:
 *
 * Basic role check:
 * <div *hasPermission="'SystemOwner'">Only system owners can see this</div>
 * <div *hasPermission="['Admin', 'SuperAdmin']">Only admins can see this</div>
 *
 * Permission function check:
 * <div *hasPermission="'canCreateCompany'">Only users who can create companies see this</div>
 *
 * Complex permission check:
 * <div *hasPermission="['canUpdateTrip', trip.companyId]">Only users who can update this trip see this</div>
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;

  // The permission to check, can be a role, array of roles, or permission function name
  @Input('hasPermission') permission!: string | string[] | any[];

  // If specified, shows the element when the user does NOT have the permission
  @Input('hasPermissionElse') else?: TemplateRef<any>;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });

    this.updateView();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const hasPermission = this.checkPermission();

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;

      if (this.else) {
        this.viewContainer.createEmbeddedView(this.else);
      }
    } else if (!hasPermission && !this.hasView && this.else) {
      this.viewContainer.createEmbeddedView(this.else);
    }
  }

  private checkPermission(): boolean {
    if (!this.permission) {
      return false;
    }

    // Check if it's a role-based permission
    if (typeof this.permission === 'string') {
      // Check if this is a UserRole enum value
      if (Object.values(UserRole).includes(this.permission as UserRole)) {
        return this.authService.hasRole(this.permission as UserRole);
      }

      // Otherwise, it's a permission function name
      const permissionFunctionName = this.permission as keyof PermissionService;
      const permissionFunction = this.permissionService[permissionFunctionName];
      if (typeof permissionFunction === 'function') {
        // TypeScript doesn't like direct function calls here due to 'this' binding
        // Using a type assertion as a workaround
        return (permissionFunction as Function).call(this.permissionService);
      }

      return false;
    }

    // Check if it's multiple roles
    if (
      Array.isArray(this.permission) &&
      this.permission.every((item) => typeof item === 'string') &&
      this.permission.every((item) =>
        Object.values(UserRole).includes(item as UserRole)
      )
    ) {
      return this.authService.hasRole(this.permission as UserRole[]);
    }

    // Check if it's a permission function with parameters
    if (
      Array.isArray(this.permission) &&
      typeof this.permission[0] === 'string'
    ) {
      const [functionName, ...args] = this.permission;
      const permissionFunctionName = functionName as keyof PermissionService;
      const permissionFunction = this.permissionService[permissionFunctionName];

      if (typeof permissionFunction === 'function') {
        // TypeScript doesn't like direct function calls here due to 'this' binding
        // Using a type assertion as a workaround
        return (permissionFunction as Function).apply(
          this.permissionService,
          args
        );
      }
    }

    return false;
  }
}
