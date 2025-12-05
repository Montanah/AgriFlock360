import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    console.log('Required permissions:', requiredPermissions);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    console.log('User ID:', request.user);

    console.log('User ID:', userId);

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    // Fetch user with role and permissions
    const user = await this.usersService.getUserWithRoleAndPermissions(userId);

    console.log('User:', user);

    if (!user || !user.role) {
      throw new ForbiddenException('User role not found');
    }

    // Check if user is active
    if (!user.is_active || user.status !== 'active') {
      throw new ForbiddenException('User account is not active');
    }

    // Get user's permissions
    const userPermissions = user.role.permissions.map((p) => p.name);
    console.log('User permissions:', userPermissions);
    // Super admin bypass (has system.admin permission)
    if (userPermissions.includes('system.admin')) {
      return true;
    }

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}

// Alternative: More flexible permissions guard that checks for ANY permission (OR logic)
@Injectable()
export class AnyPermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const user = await this.usersService.getUserWithRoleAndPermissions(userId);

    if (!user || !user.role) {
      throw new ForbiddenException('User role not found');
    }

    if (!user.is_active || user.status !== 'active') {
      throw new ForbiddenException('User account is not active');
    }

    const userPermissions = user.role.permissions.map((p) => p.name);

    // Super admin bypass
    if (userPermissions.includes('system.admin')) {
      return true;
    }

    // Check if user has ANY of the required permissions (OR logic)
    const hasAnyPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAnyPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required one of: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}

// Helper decorator for checking any permission (OR logic)
// export const RequireAnyPermission = (...permissions: string[]) =>
//   SetMetadata(PERMISSIONS_KEY, permissions);

// Usage examples:

// Example 1: Require ALL permissions (AND logic) - use PermissionsGuard
// @UseGuards(JwtAuthGuard, PermissionsGuard)
// @RequirePermissions('users.update', 'users.delete')
// async updateAndDeleteUser() { ... }

// Example 2: Require ANY permission (OR logic) - use AnyPermissionsGuard
// @UseGuards(JwtAuthGuard, AnyPermissionsGuard)
// @RequireAnyPermission('users.read', 'users.manage')
// async viewUser() { ... }
