// Permission checking utilities
export interface Permission {
  id: string
  name: string
  description: string
}

export interface Role {
  id: string
  name: string
  description: string
  color: string
  icon?: any
  permissions: string[]
  isSystem: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  lastLogin?: string
}

// Permission categories for organization
export const PERMISSION_CATEGORIES = {
  SYSTEM: "system",
  USERS: "users",
  IMAGES: "images",
  MODELS: "models",
  ANALYTICS: "analytics",
} as const

// All available permissions
export const PERMISSIONS = {
  // System Administration
  SYSTEM_ADMIN: "system.admin",
  SYSTEM_CONFIG: "system.config",
  SYSTEM_LOGS: "system.logs",

  // User Management
  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_EDIT: "users.edit",
  USERS_DELETE: "users.delete",
  USERS_ROLES: "users.roles",

  // Image Processing
  IMAGES_UPLOAD: "images.upload",
  IMAGES_ENHANCE: "images.enhance",
  IMAGES_DOWNLOAD: "images.download",
  IMAGES_VIEW_ALL: "images.view_all",
  IMAGES_DELETE_ANY: "images.delete_any",

  // AI Models
  MODELS_VIEW: "models.view",
  MODELS_CONFIGURE: "models.configure",
  MODELS_TEST: "models.test",
  MODELS_DISCOVER: "models.discover",

  // Analytics
  ANALYTICS_VIEW: "analytics.view",
  ANALYTICS_EXPORT: "analytics.export",
  ANALYTICS_USERS: "analytics.users",
} as const

// Default role permissions
export const DEFAULT_ROLE_PERMISSIONS = {
  user: [PERMISSIONS.IMAGES_UPLOAD, PERMISSIONS.IMAGES_ENHANCE, PERMISSIONS.IMAGES_DOWNLOAD, PERMISSIONS.MODELS_VIEW],
  moderator: [
    PERMISSIONS.IMAGES_UPLOAD,
    PERMISSIONS.IMAGES_ENHANCE,
    PERMISSIONS.IMAGES_DOWNLOAD,
    PERMISSIONS.IMAGES_VIEW_ALL,
    PERMISSIONS.MODELS_VIEW,
    PERMISSIONS.MODELS_TEST,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  admin: Object.values(PERMISSIONS),
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User, permission: string, roles: Role[]): boolean {
  const userRole = roles.find((role) => role.id === user.role)
  if (!userRole) return false

  return userRole.permissions.includes(permission)
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: User, permissions: string[], roles: Role[]): boolean {
  return permissions.some((permission) => hasPermission(user, permission, roles))
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user: User, permissions: string[], roles: Role[]): boolean {
  return permissions.every((permission) => hasPermission(user, permission, roles))
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(user: User, roles: Role[]): string[] {
  const userRole = roles.find((role) => role.id === user.role)
  return userRole?.permissions || []
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: User): boolean {
  return user.role === "admin"
}

/**
 * Check if a user is a moderator or higher
 */
export function isModerator(user: User): boolean {
  return ["admin", "moderator"].includes(user.role)
}

/**
 * Get role hierarchy level (higher number = more permissions)
 */
export function getRoleLevel(role: string): number {
  const levels = {
    user: 1,
    moderator: 2,
    admin: 3,
  }
  return levels[role] || 0
}

/**
 * Check if user can manage another user (based on role hierarchy)
 */
export function canManageUser(currentUser: User, targetUser: User): boolean {
  if (currentUser.id === targetUser.id) return false // Can't manage self
  return getRoleLevel(currentUser.role) > getRoleLevel(targetUser.role)
}
