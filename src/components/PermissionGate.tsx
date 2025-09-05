import React from 'react';
import { View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissions';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, requires ALL permissions; if false, requires ANY permission
  fallback?: React.ReactNode;
  requireAuth?: boolean; // If true, requires user to be authenticated
}

/**
 * PermissionGate component for conditional rendering based on user permissions
 * 
 * Usage examples:
 * 
 * // Single permission check
 * <PermissionGate permission={Permission.CREATE_CAR}>
 *   <CreateCarButton />
 * </PermissionGate>
 * 
 * // Multiple permissions (ANY)
 * <PermissionGate permissions={[Permission.CREATE_CAR, Permission.UPDATE_CAR]}>
 *   <CarManagementButtons />
 * </PermissionGate>
 * 
 * // Multiple permissions (ALL)
 * <PermissionGate 
 *   permissions={[Permission.CREATE_CAR, Permission.ADMIN_ACCESS]} 
 *   requireAll={true}
 * >
 *   <AdminCarCreateButton />
 * </PermissionGate>
 * 
 * // With fallback content
 * <PermissionGate 
 *   permission={Permission.CREATE_CAR}
 *   fallback={<Text>You need seller permissions to create cars</Text>}
 * >
 *   <CreateCarButton />
 * </PermissionGate>
 * 
 * // Require authentication only
 * <PermissionGate requireAuth={true}>
 *   <UserProfile />
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  requireAuth = false,
}) => {
  const { user, isAuthenticated } = useAuth();

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  // If no specific permissions are required, but auth is required, show content
  if (requireAuth && isAuthenticated && !permission && permissions.length === 0) {
    return <>{children}</>;
  }

  // If no permissions specified and no auth required, always show
  if (!requireAuth && !permission && permissions.length === 0) {
    return <>{children}</>;
  }

  let hasRequiredPermission = false;

  // Check single permission
  if (permission) {
    hasRequiredPermission = hasPermission(user, permission);
  }
  // Check multiple permissions
  else if (permissions.length > 0) {
    if (requireAll) {
      hasRequiredPermission = hasAllPermissions(user, permissions);
    } else {
      hasRequiredPermission = hasAnyPermission(user, permissions);
    }
  }

  // Show content if user has required permissions
  if (hasRequiredPermission) {
    return <>{children}</>;
  }

  // Show fallback or nothing
  return fallback ? <>{fallback}</> : null;
};

/**
 * Higher-order component version of PermissionGate
 */
export const withPermission = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permissionConfig: Omit<PermissionGateProps, 'children'>
) => {
  const PermissionWrappedComponent: React.FC<P> = (props) => (
    <PermissionGate {...permissionConfig}>
      <WrappedComponent {...props} />
    </PermissionGate>
  );

  PermissionWrappedComponent.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name})`;

  return PermissionWrappedComponent;
};

/**
 * Hook for getting permission status
 */
export const usePermission = (permission: Permission) => {
  const { user } = useAuth();
  return hasPermission(user, permission);
};

/**
 * Hook for getting multiple permission status
 */
export const usePermissions = (permissions: Permission[], requireAll = false) => {
  const { user } = useAuth();
  
  if (requireAll) {
    return hasAllPermissions(user, permissions);
  }
  
  return hasAnyPermission(user, permissions);
};

export default PermissionGate;
