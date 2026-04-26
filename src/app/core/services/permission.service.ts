import { Injectable } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';
import { User, UserRole } from '../../features/auth/models/user.model';

/**
 * Centralized, role-aware permission checks used by UI guards/directives.
 */
@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  constructor(private authService: AuthService) {}

  private get currentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  private isSystemOwner(user: User | null): boolean {
    return user?.userType === UserRole.SystemOwner;
  }

  private isSuperAdmin(user: User | null): boolean {
    return user?.userType === UserRole.SuperAdmin;
  }

  private isCompanyAdmin(user: User | null): boolean {
    return user?.userType === UserRole.Admin;
  }

  private sameCompany(user: User | null, companyId?: number): boolean {
    return !!user?.companyId && !!companyId && user.companyId === companyId;
  }

  canAccessAdminDashboard(): boolean {
    return this.authService.isAdminOrHigher();
  }

  canCreateCompany(): boolean {
    return this.authService.hasRole(UserRole.SystemOwner);
  }

  canUpdateCompany(companyId?: number): boolean {
    const user = this.currentUser;

    if (this.isSystemOwner(user)) {
      return true;
    }

    return this.isSuperAdmin(user) && this.sameCompany(user, companyId);
  }

  canDeleteCompany(): boolean {
    return this.authService.hasRole(UserRole.SystemOwner);
  }

  canCreateSuperAdmin(): boolean {
    return this.authService.hasRole(UserRole.SystemOwner);
  }

  canCreateAdmin(companyId?: number): boolean {
    const user = this.currentUser;

    if (this.isSystemOwner(user)) {
      return true;
    }

    return this.isSuperAdmin(user) && this.sameCompany(user, companyId);
  }

  canCreateDriver(companyId?: number): boolean {
    const user = this.currentUser;

    if (this.isSystemOwner(user)) {
      return true;
    }

    return (
      (this.isSuperAdmin(user) || this.isCompanyAdmin(user)) &&
      this.sameCompany(user, companyId)
    );
  }

  canUpdateUser(
    userId: string,
    userRole: UserRole,
    userCompanyId?: number,
  ): boolean {
    const currentUser = this.currentUser;
    if (!currentUser) {
      return false;
    }

    if (this.isSystemOwner(currentUser)) {
      return true;
    }

    if (
      this.isSuperAdmin(currentUser) &&
      this.sameCompany(currentUser, userCompanyId) &&
      userRole !== UserRole.SuperAdmin
    ) {
      return true;
    }

    if (
      this.isCompanyAdmin(currentUser) &&
      this.sameCompany(currentUser, userCompanyId) &&
      userRole === UserRole.Driver
    ) {
      return true;
    }

    return currentUser.id === userId;
  }

  canDeleteUser(
    userId: string,
    userRole: UserRole,
    userCompanyId?: number,
  ): boolean {
    const currentUser = this.currentUser;
    if (!currentUser) {
      return false;
    }

    if (this.isSystemOwner(currentUser) && currentUser.id !== userId) {
      return true;
    }

    if (
      this.isSuperAdmin(currentUser) &&
      currentUser.id !== userId &&
      this.sameCompany(currentUser, userCompanyId) &&
      userRole !== UserRole.SuperAdmin
    ) {
      return true;
    }

    if (
      this.isCompanyAdmin(currentUser) &&
      this.sameCompany(currentUser, userCompanyId) &&
      userRole === UserRole.Driver
    ) {
      return true;
    }

    return false;
  }

  canCreateSystemStation(): boolean {
    return this.authService.hasRole([
      UserRole.SystemOwner,
      UserRole.SuperAdmin,
    ]);
  }

  canCreateCompanyStation(): boolean {
    return this.authService.isAdminOrHigher();
  }

  canUpdateStation(isSystemOwned: boolean, stationCompanyId?: number): boolean {
    const user = this.currentUser;
    if (!user) {
      return false;
    }

    if (this.isSystemOwner(user)) {
      return true;
    }

    if (
      this.isSuperAdmin(user) &&
      (isSystemOwned || this.sameCompany(user, stationCompanyId))
    ) {
      return true;
    }

    if (
      this.isCompanyAdmin(user) &&
      !isSystemOwned &&
      this.sameCompany(user, stationCompanyId)
    ) {
      return true;
    }

    return false;
  }

  canDeleteStation(isSystemOwned: boolean, stationCompanyId?: number): boolean {
    return this.canUpdateStation(isSystemOwned, stationCompanyId);
  }

  canCreateTrip(): boolean {
    return this.authService.isAdminOrHigher();
  }

  canUpdateTrip(tripCompanyId?: number): boolean {
    const user = this.currentUser;
    if (!user) {
      return false;
    }

    if (this.isSystemOwner(user)) {
      return true;
    }

    return (
      (this.isSuperAdmin(user) || this.isCompanyAdmin(user)) &&
      this.sameCompany(user, tripCompanyId)
    );
  }

  canDeleteTrip(tripCompanyId?: number): boolean {
    return this.canUpdateTrip(tripCompanyId);
  }

  canManageCities(): boolean {
    return this.authService.hasRole([
      UserRole.SystemOwner,
      UserRole.SuperAdmin,
    ]);
  }
}
