import { UserData } from '../services/ApiClient';

// User roles in the system
export enum UserRole {
  ADMIN = 'ADMIN',
  DEALER = 'DEALER',
  SELLER = 'SELLER',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

// Permission types
export enum Permission {
  // Car management permissions
  CREATE_CAR = 'CREATE_CAR',
  UPDATE_CAR = 'UPDATE_CAR',
  DELETE_CAR = 'DELETE_CAR',
  VIEW_CAR = 'VIEW_CAR',
  FEATURE_CAR = 'FEATURE_CAR',

  // User management permissions
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_USERS = 'VIEW_USERS',

  // Chat permissions
  CHAT_WITH_USERS = 'CHAT_WITH_USERS',

  // Analytics permissions
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  VIEW_SYSTEM_ANALYTICS = 'VIEW_SYSTEM_ANALYTICS',

  // Admin permissions
  ADMIN_ACCESS = 'ADMIN_ACCESS',
}

// Role to permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.CREATE_CAR,
    Permission.UPDATE_CAR,
    Permission.DELETE_CAR,
    Permission.VIEW_CAR,
    Permission.FEATURE_CAR,
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.CHAT_WITH_USERS,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_SYSTEM_ANALYTICS,
    Permission.ADMIN_ACCESS,
  ],
  [UserRole.DEALER]: [
    Permission.CREATE_CAR,
    Permission.UPDATE_CAR,
    Permission.DELETE_CAR,
    Permission.VIEW_CAR,
    Permission.FEATURE_CAR,
    Permission.CHAT_WITH_USERS,
    Permission.VIEW_ANALYTICS,
  ],
  [UserRole.SELLER]: [
    Permission.CREATE_CAR,
    Permission.UPDATE_CAR,
    Permission.DELETE_CAR,
    Permission.VIEW_CAR,
    Permission.CHAT_WITH_USERS,
    Permission.VIEW_ANALYTICS,
  ],
  [UserRole.VIEWER]: [
    Permission.VIEW_CAR,
    Permission.CHAT_WITH_USERS,
  ],
  [UserRole.USER]: [
    Permission.VIEW_CAR,
    Permission.CHAT_WITH_USERS,
  ],
};

// Cache for permission lookups to avoid repeated calculations
const permissionCache = new Map<string, boolean>();

/**
 * Check if a user has a specific permission (with caching)
 */
export const hasPermission = (user: UserData | null, permission: Permission): boolean => {
  if (!user || !user.role) return false;

  const cacheKey = `${user.userId}-${user.role}-${permission}`;
  const cached = permissionCache.get(cacheKey);

  if (cached !== undefined) {
    return cached;
  }

  const userRole = user.role.toUpperCase() as UserRole;
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  const result = rolePermissions ? rolePermissions.includes(permission) : false;

  // Cache the result (limit cache size to prevent memory leaks)
  if (permissionCache.size > 1000) {
    permissionCache.clear();
  }
  permissionCache.set(cacheKey, result);

  return result;
};

/**
 * Check if a user has any of the specified permissions
 */
export const hasAnyPermission = (user: UserData | null, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if a user has all of the specified permissions
 */
export const hasAllPermissions = (user: UserData | null, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Check if user can create cars
 */
export const canCreateCars = (user: UserData | null): boolean => {
  return hasPermission(user, Permission.CREATE_CAR);
};

/**
 * Check if user can update cars
 */
export const canUpdateCars = (user: UserData | null): boolean => {
  return hasPermission(user, Permission.UPDATE_CAR);
};

/**
 * Check if user can delete cars
 */
export const canDeleteCars = (user: UserData | null): boolean => {
  return hasPermission(user, Permission.DELETE_CAR);
};

/**
 * Check if user can feature cars
 */
export const canFeatureCars = (user: UserData | null): boolean => {
  return hasPermission(user, Permission.FEATURE_CAR);
};

/**
 * Check if user can view analytics
 */
export const canViewAnalytics = (user: UserData | null): boolean => {
  return hasPermission(user, Permission.VIEW_ANALYTICS);
};

/**
 * Check if user can chat with other users
 */
export const canChat = (user: UserData | null): boolean => {
  return hasPermission(user, Permission.CHAT_WITH_USERS);
};

/**
 * Check if user is admin
 */
export const isAdmin = (user: UserData | null): boolean => {
  return hasPermission(user, Permission.ADMIN_ACCESS);
};

/**
 * Check if user is seller or higher
 */
export const isSellerOrHigher = (user: UserData | null): boolean => {
  return hasAnyPermission(user, [Permission.CREATE_CAR, Permission.ADMIN_ACCESS]);
};

/**
 * Check if user is dealer or higher
 */
export const isDealerOrHigher = (user: UserData | null): boolean => {
  return hasPermission(user, Permission.FEATURE_CAR);
};

/**
 * Get readable role name
 */
export const getRoleName = (role: string): string => {
  switch (role?.toUpperCase()) {
    case UserRole.ADMIN:
      return 'Administrator';
    case UserRole.DEALER:
      return 'Dealer';
    case UserRole.SELLER:
      return 'Seller';
    case UserRole.USER:
    case UserRole.VIEWER:
      return 'Normal User';
    default:
      return 'Unknown';
  }
};

/**
 * Get all permissions for a role
 */
export const getPermissionsForRole = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if user can perform action on a specific car (optimized)
 * (e.g., update/delete their own cars)
 */
export const canPerformActionOnCar = (
  user: UserData | null,
  permission: Permission,
  carOwnerId?: string | number
): boolean => {
  if (!user) return false;

  // Cache key for ownership checks
  const cacheKey = `${user.userId}-${permission}-${carOwnerId || 'no-owner'}`;
  const cached = permissionCache.get(cacheKey);

  if (cached !== undefined) {
    return cached;
  }

  let result = false;

  // Admins can do anything
  if (isAdmin(user)) {
    result = true;
  } else {
    // Check if user has the general permission
    if (!hasPermission(user, permission)) {
      result = false;
    } else if (carOwnerId === undefined) {
      // If no car owner ID provided, assume general permission check
      result = true;
    } else {
      // Users can only modify their own cars (unless admin)
      result = user.userId.toString() === carOwnerId?.toString();
    }
  }

  // Cache the result
  if (permissionCache.size > 1000) {
    permissionCache.clear();
  }
  permissionCache.set(cacheKey, result);

  return result;
};


