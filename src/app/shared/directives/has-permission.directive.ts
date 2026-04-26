import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { UserRole } from '../../features/auth/models/user.model';

type PermissionInput =
  | string
  | readonly string[]
  | readonly [string, ...unknown[]];

type RenderState = 'none' | 'then' | 'else';

/**
 * Directive to conditionally show UI elements based on user roles/permissions
 *
 * Usage examples:
 *
 * Basic role check:
 * <div *appHasPermission="'SystemOwner'">Only system owners can see this</div>
 * <div *appHasPermission="['Admin', 'SuperAdmin']">Only admins can see this</div>
 *
 * Permission function check:
 * <div *appHasPermission="'canCreateCompany'">Only users who can create companies see this</div>
 *
 * Complex permission check:
 * <div *appHasPermission="['canUpdateTrip', trip.companyId]">Only users who can update this trip see this</div>
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnChanges, OnDestroy {
  private destroy$ = new Subject<void>();
  private renderState: RenderState = 'none';
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);

  // The permission to check, can be a role, array of roles, or permission function name
  @Input() appHasPermission!: PermissionInput;

  // If specified, shows the element when the user does NOT have the permission
  @Input() appHasPermissionElse?: TemplateRef<unknown>;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });

    this.updateView();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appHasPermission'] || changes['appHasPermissionElse']) {
      this.updateView();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const hasPermission = this.checkPermission();
    const nextState: RenderState = hasPermission
      ? 'then'
      : this.appHasPermissionElse
        ? 'else'
        : 'none';

    if (nextState === this.renderState) {
      return;
    }

    this.viewContainer.clear();

    if (nextState === 'then') {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else if (nextState === 'else' && this.appHasPermissionElse) {
      this.viewContainer.createEmbeddedView(this.appHasPermissionElse);
    }

    this.renderState = nextState;
  }

  private isUserRole(value: string): value is UserRole {
    return (Object.values(UserRole) as string[]).includes(value);
  }

  private isUserRoleArray(
    values: readonly string[],
  ): values is readonly UserRole[] {
    return values.length > 0 && values.every((value) => this.isUserRole(value));
  }

  private invokePermissionFunction(
    functionName: string,
    args: readonly unknown[],
  ): boolean {
    const methodCandidate = (
      this.permissionService as unknown as Record<string, unknown>
    )[functionName];

    if (typeof methodCandidate !== 'function') {
      return false;
    }

    const result = (
      methodCandidate as (...permissionArgs: readonly unknown[]) => unknown
    ).apply(this.permissionService, [...args]);

    return typeof result === 'boolean' ? result : false;
  }

  private checkPermission(): boolean {
    if (!this.appHasPermission) {
      return false;
    }

    if (typeof this.appHasPermission === 'string') {
      if (this.isUserRole(this.appHasPermission)) {
        return this.authService.hasRole(this.appHasPermission);
      }

      return this.invokePermissionFunction(this.appHasPermission, []);
    }

    const hasOnlyStringValues = this.appHasPermission.every(
      (item) => typeof item === 'string',
    );

    if (hasOnlyStringValues) {
      const roleCandidates = this.appHasPermission as readonly string[];
      if (this.isUserRoleArray(roleCandidates)) {
        return this.authService.hasRole([...roleCandidates]);
      }
    }

    if (
      this.appHasPermission.length > 0 &&
      typeof this.appHasPermission[0] === 'string'
    ) {
      const [functionName, ...args] = this.appHasPermission;
      return this.invokePermissionFunction(functionName, args);
    }

    return false;
  }
}
