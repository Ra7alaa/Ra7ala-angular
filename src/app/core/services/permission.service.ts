import { Injectable } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserRole } from '../../features/auth/models/user.model';

/**
 * Permission service for checking permissions across the application
 * This provides a centralized way to check if users can perform certain actions
 */
@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  constructor(private authService: AuthService) {}

  // General permission checks
  canAccessAdminDashboard(): boolean {
    return this.authService.isAdminOrHigher();
  }

  // Company permissions
  canCreateCompany(): boolean {
    return this.authService.hasRole(UserRole.SystemOwner);
  }

  canUpdateCompany(companyId?: number): boolean {
    const user = this.authService.getCurrentUser();

    // System owner can update any company
    if (user?.isSystemOwner) return true;

    // SuperAdmin can only update their own company
    if (user?.isSuperAdmin && companyId && user.companyId === companyId)
      return true;

    return false;
  }

  canDeleteCompany(): boolean {
    return this.authService.hasRole(UserRole.SystemOwner);
  }

  // User management permissions
  canCreateSuperAdmin(): boolean {
    return this.authService.hasRole(UserRole.SystemOwner);
  }

  canCreateAdmin(companyId?: number): boolean {
    const user = this.authService.getCurrentUser();

    // System owner can create admin for any company
    if (user?.isSystemOwner) return true;

    // SuperAdmin can only create admin for their own company
    if (user?.isSuperAdmin && companyId && user.companyId === companyId)
      return true;

    return false;
  }

  canCreateDriver(companyId?: number): boolean {
    const user = this.authService.getCurrentUser();

    // SuperAdmin or Admin can only create drivers for their own company
    if (
      (user?.isSuperAdmin || user?.isCompanyAdmin) &&
      companyId &&
      user.companyId === companyId
    ) {
      return true;
    }

    // System owner can create driver for any company
    if (user?.isSystemOwner) return true;

    return false;
  }

  canUpdateUser(
    userId: number,
    userRole: UserRole,
    userCompanyId?: number
  ): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;

    // System owner can update any user
    if (currentUser.isSystemOwner) return true;

    // SuperAdmin can update any user in their company except other SuperAdmins
    if (
      currentUser.isSuperAdmin &&
      userCompanyId === currentUser.companyId &&
      userRole !== UserRole.SuperAdmin
    ) {
      return true;
    }

    // Admin can update drivers in their company
    if (
      currentUser.isCompanyAdmin &&
      userCompanyId === currentUser.companyId &&
      userRole === UserRole.Driver
    ) {
      return true;
    }

    // Users can update their own profile
    if (currentUser.id === userId) return true;

    return false;
  }

  canDeleteUser(
    userId: number,
    userRole: UserRole,
    userCompanyId?: number
  ): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;

    // System owner can delete any user except themselves
    if (currentUser.isSystemOwner && currentUser.id !== userId) return true;

    // SuperAdmin can delete any user in their company except other SuperAdmins and themselves
    if (
      currentUser.isSuperAdmin &&
      currentUser.id !== userId &&
      userCompanyId === currentUser.companyId &&
      userRole !== UserRole.SuperAdmin
    ) {
      return true;
    }

    // Admin can delete drivers in their company
    if (
      currentUser.isCompanyAdmin &&
      userCompanyId === currentUser.companyId &&
      userRole === UserRole.Driver
    ) {
      return true;
    }

    return false;
  }

  // Station permissions
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
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    // System owner can update any station
    if (user.isSystemOwner) return true;

    // SuperAdmin can update system stations and their company stations
    if (
      user.isSuperAdmin &&
      (isSystemOwned ||
        (stationCompanyId && user.companyId === stationCompanyId))
    ) {
      return true;
    }

    // Admin can only update their company stations
    if (
      user.isCompanyAdmin &&
      !isSystemOwned &&
      stationCompanyId &&
      user.companyId === stationCompanyId
    ) {
      return true;
    }

    return false;
  }

  canDeleteStation(isSystemOwned: boolean, stationCompanyId?: number): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    // System owner can delete any station
    if (user.isSystemOwner) return true;

    // SuperAdmin can delete system stations and their company stations
    if (
      user.isSuperAdmin &&
      (isSystemOwned ||
        (stationCompanyId && user.companyId === stationCompanyId))
    ) {
      return true;
    }

    // Admin can only delete their company stations
    if (
      user.isCompanyAdmin &&
      !isSystemOwned &&
      stationCompanyId &&
      user.companyId === stationCompanyId
    ) {
      return true;
    }

    return false;
  }

  // Trip permissions
  canCreateTrip(): boolean {
    return this.authService.isAdminOrHigher();
  }

  canUpdateTrip(tripCompanyId?: number): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    // System owner can update any trip
    if (user.isSystemOwner) return true;

    // SuperAdmin and Admin can only update their company trips
    if (
      (user.isSuperAdmin || user.isCompanyAdmin) &&
      tripCompanyId &&
      user.companyId === tripCompanyId
    ) {
      return true;
    }

    return false;
  }

  canDeleteTrip(tripCompanyId?: number): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    // System owner can delete any trip
    if (user.isSystemOwner) return true;

    // SuperAdmin and Admin can only delete their company trips
    if (
      (user.isSuperAdmin || user.isCompanyAdmin) &&
      tripCompanyId &&
      user.companyId === tripCompanyId
    ) {
      return true;
    }

    return false;
  }

  // City permissions
  canManageCities(): boolean {
    return this.authService.hasRole([
      UserRole.SystemOwner,
      UserRole.SuperAdmin,
    ]);
  }

  // Add more permission checks as needed...
}
