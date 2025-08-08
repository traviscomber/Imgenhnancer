"use client"

import { useState } from "react"
import { Shield, Plus, Edit, Trash2, Users, Settings, Eye, FileText, Database, Zap, Crown, UserCheck, Lock, Unlock, MoreHorizontal } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

// Permission categories and definitions
const permissionCategories = {
  users: {
    name: "User Management",
    icon: Users,
    permissions: [
      { id: "users.view", name: "View Users", description: "View user profiles and information" },
      { id: "users.create", name: "Create Users", description: "Create new user accounts" },
      { id: "users.edit", name: "Edit Users", description: "Modify user profiles and settings" },
      { id: "users.delete", name: "Delete Users", description: "Remove user accounts" },
      { id: "users.suspend", name: "Suspend Users", description: "Suspend or activate user accounts" }
    ]
  },
  roles: {
    name: "Role Management",
    icon: Shield,
    permissions: [
      { id: "roles.view", name: "View Roles", description: "View role definitions and permissions" },
      { id: "roles.create", name: "Create Roles", description: "Create new roles" },
      { id: "roles.edit", name: "Edit Roles", description: "Modify role permissions" },
      { id: "roles.delete", name: "Delete Roles", description: "Remove roles" },
      { id: "roles.assign", name: "Assign Roles", description: "Assign roles to users" }
    ]
  },
  enhancement: {
    name: "Image Enhancement",
    icon: Zap,
    permissions: [
      { id: "enhancement.use", name: "Use Enhancement", description: "Access image enhancement features" },
      { id: "enhancement.bulk", name: "Bulk Enhancement", description: "Process multiple images at once" },
      { id: "enhancement.priority", name: "Priority Processing", description: "Get priority in processing queue" },
      { id: "enhancement.advanced", name: "Advanced Settings", description: "Access advanced enhancement options" },
      { id: "enhancement.models", name: "All Models", description: "Access to all AI models including experimental ones" }
    ]
  },
  system: {
    name: "System Administration",
    icon: Settings,
    permissions: [
      { id: "system.config", name: "System Configuration", description: "Modify system settings and configuration" },
      { id: "system.logs", name: "View Logs", description: "Access system logs and monitoring" },
      { id: "system.maintenance", name: "Maintenance Mode", description: "Enable/disable maintenance mode" },
      { id: "system.backup", name: "Backup Management", description: "Create and restore system backups" },
      { id: "system.api", name: "API Management", description: "Manage API keys and integrations" }
    ]
  },
  content: {
    name: "Content Management",
    icon: FileText,
    permissions: [
      { id: "content.view", name: "View Content", description: "View all user-generated content" },
      { id: "content.moderate", name: "Moderate Content", description: "Review and moderate user content" },
      { id: "content.delete", name: "Delete Content", description: "Remove inappropriate content" },
      { id: "content.export", name: "Export Content", description: "Export content and data" }
    ]
  },
  analytics: {
    name: "Analytics & Reports",
    icon: Database,
    permissions: [
      { id: "analytics.view", name: "View Analytics", description: "Access usage analytics and reports" },
      { id: "analytics.export", name: "Export Reports", description: "Export analytics data and reports" },
      { id: "analytics.users", name: "User Analytics", description: "View detailed user behavior analytics" },
      { id: "analytics.system", name: "System Analytics", description: "View system performance metrics" }
    ]
  }
}

// Predefined roles with their permissions
const defaultRoles = [
  {
    id: 1,
    name: "Administrator",
    description: "Full system access with all permissions",
    color: "bg-red-600",
    isSystem: true,
    userCount: 2,
    permissions: Object.values(permissionCategories).flatMap(cat => 
      cat.permissions.map(p => p.id)
    )
  },
  {
    id: 2,
    name: "Moderator",
    description: "Content moderation and user management",
    color: "bg-yellow-600",
    isSystem: true,
    userCount: 3,
    permissions: [
      "users.view", "users.suspend",
      "content.view", "content.moderate", "content.delete",
      "enhancement.use", "enhancement.bulk",
      "analytics.view"
    ]
  },
  {
    id: 3,
    name: "Premium User",
    description: "Enhanced features and priority processing",
    color: "bg-purple-600",
    isSystem: false,
    userCount: 15,
    permissions: [
      "enhancement.use", "enhancement.bulk", "enhancement.priority", 
      "enhancement.advanced", "enhancement.models"
    ]
  },
  {
    id: 4,
    name: "User",
    description: "Basic user with standard enhancement features",
    color: "bg-blue-600",
    isSystem: true,
    userCount: 156,
    permissions: [
      "enhancement.use"
    ]
  }
]

export function RoleManagement() {
  const [roles, setRoles] = useState(defaultRoles)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    color: "bg-blue-600",
    permissions: []
  })

  // Role statistics
  const roleStats = {
    total: roles.length,
    system: roles.filter(r => r.isSystem).length,
    custom: roles.filter(r => !r.isSystem).length,
    totalUsers: roles.reduce((sum, role) => sum + role.userCount, 0)
  }

  const handleCreateRole = () => {
    const role = {
      id: Math.max(...roles.map(r => r.id)) + 1,
      ...newRole,
      isSystem: false,
      userCount: 0
    }
    setRoles([...roles, role])
    setNewRole({
      name: "",
      description: "",
      color: "bg-blue-600",
      permissions: []
    })
    setShowCreateDialog(false)
  }

  const handleEditRole = (role) => {
    setEditingRole({ ...role })
    setShowEditDialog(true)
  }

  const handleUpdateRole = () => {
    setRoles(roles.map(r => r.id === editingRole.id ? editingRole : r))
    setShowEditDialog(false)
    setEditingRole(null)
  }

  const handleDeleteRole = (roleId) => {
    const role = roles.find(r => r.id === roleId)
    if (role?.isSystem) {
      alert("Cannot delete system roles")
      return
    }
    if (role?.userCount > 0) {
      alert("Cannot delete roles that are assigned to users")
      return
    }
    if (confirm("Are you sure you want to delete this role?")) {
      setRoles(roles.filter(r => r.id !== roleId))
    }
  }

  const togglePermission = (roleData, setRoleData, permissionId) => {
    const hasPermission = roleData.permissions.includes(permissionId)
    const newPermissions = hasPermission
      ? roleData.permissions.filter(p => p !== permissionId)
      : [...roleData.permissions, permissionId]
    
    setRoleData({ ...roleData, permissions: newPermissions })
  }

  const toggleCategoryPermissions = (roleData, setRoleData, category) => {
    const categoryPermissions = category.permissions.map(p => p.id)
    const hasAllPermissions = categoryPermissions.every(p => roleData.permissions.includes(p))
    
    let newPermissions
    if (hasAllPermissions) {
      // Remove all category permissions
      newPermissions = roleData.permissions.filter(p => !categoryPermissions.includes(p))
    } else {
      // Add all category permissions
      newPermissions = [...new Set([...roleData.permissions, ...categoryPermissions])]
    }
    
    setRoleData({ ...roleData, permissions: newPermissions })
  }

  const getPermissionCount = (rolePermissions) => {
    return rolePermissions.length
  }

  const getCategoryPermissionCount = (rolePermissions, category) => {
    const categoryPermissions = category.permissions.map(p => p.id)
    return categoryPermissions.filter(p => rolePermissions.includes(p)).length
  }

  const PermissionMatrix = ({ roleData, setRoleData, readOnly = false }) => (
    <div className="space-y-6">
      {Object.entries(permissionCategories).map(([categoryKey, category]) => {
        const categoryPermissions = category.permissions.map(p => p.id)
        const hasAllPermissions = categoryPermissions.every(p => roleData.permissions.includes(p))
        const hasPartialPermissions = categoryPermissions.some(p => roleData.permissions.includes(p)) && !hasAllPermissions
        
        return (
          <div key={categoryKey} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <category.icon className="w-5 h-5 text-blue-400" />
                <h4 className="text-white font-medium">{category.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {getCategoryPermissionCount(roleData.permissions, category)}/{category.permissions.length}
                </Badge>
              </div>
              {!readOnly && (
                <Switch
                  checked={hasAllPermissions}
                  onCheckedChange={() => toggleCategoryPermissions(roleData, setRoleData, category)}
                  className={hasPartialPermissions ? "opacity-50" : ""}
                />
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-8">
              {category.permissions.map((permission) => (
                <div key={permission.id} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                  {!readOnly && (
                    <Switch
                      checked={roleData.permissions.includes(permission.id)}
                      onCheckedChange={() => togglePermission(roleData, setRoleData, permission.id)}
                      className="mt-0.5"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-white">{permission.name}</p>
                      {readOnly && roleData.permissions.includes(permission.id) && (
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{permission.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Role Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Roles</p>
                <p className="text-2xl font-bold text-white">{roleStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">System Roles</p>
                <p className="text-2xl font-bold text-white">{roleStats.system}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Unlock className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Custom Roles</p>
                <p className="text-2xl font-bold text-white">{roleStats.custom}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-white">{roleStats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="bg-black/20 border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Role Management</h3>
              <p className="text-gray-400">Manage user roles and permissions for the AI Enhancement Portal</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-white/20 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Role Name</Label>
                      <Input
                        id="name"
                        value={newRole.name}
                        onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Enter role name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="color">Color</Label>
                      <select
                        value={newRole.color}
                        onChange={(e) => setNewRole({...newRole, color: e.target.value})}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white"
                      >
                        <option value="bg-blue-600">Blue</option>
                        <option value="bg-green-600">Green</option>
                        <option value="bg-purple-600">Purple</option>
                        <option value="bg-yellow-600">Yellow</option>
                        <option value="bg-red-600">Red</option>
                        <option value="bg-pink-600">Pink</option>
                        <option value="bg-indigo-600">Indigo</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newRole.description}
                      onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      rows={3}
                      placeholder="Describe this role's purpose and responsibilities"
                    />
                  </div>
                  
                  <Separator className="bg-white/10" />
                  
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">Permissions</h4>
                    <PermissionMatrix roleData={newRole} setRoleData={setNewRole} />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateRole} className="bg-blue-600 hover:bg-blue-700">
                      Create Role
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Roles List */}
      <div className="grid gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="bg-black/20 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${role.color}`}></div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-white">{role.name}</h3>
                      {role.isSystem && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          System
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{role.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-white font-medium">{role.userCount} users</p>
                    <p className="text-xs text-gray-400">{getPermissionCount(role.permissions)} permissions</p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-800 border-white/20">
                      <DropdownMenuItem onClick={() => handleEditRole(role)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {!role.isSystem && (
                        <>
                          <DropdownMenuItem onClick={() => handleEditRole(role)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-red-400"
                            disabled={role.userCount > 0}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Role
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Permission Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(permissionCategories).map(([categoryKey, category]) => {
                  const categoryPermissionCount = getCategoryPermissionCount(role.permissions, category)
                  const totalCategoryPermissions = category.permissions.length
                  const hasPermissions = categoryPermissionCount > 0
                  
                  return (
                    <div key={categoryKey} className="flex items-center space-x-2 p-2 bg-white/5 rounded-lg">
                      <category.icon className={`w-4 h-4 ${hasPermissions ? 'text-green-400' : 'text-gray-500'}`} />
                      <div>
                        <p className="text-xs font-medium text-white">{category.name}</p>
                        <p className="text-xs text-gray-400">
                          {categoryPermissionCount}/{totalCategoryPermissions}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-slate-800 border-white/20 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole?.isSystem ? 'View Role Details' : 'Edit Role'}
            </DialogTitle>
          </DialogHeader>
          {editingRole && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Role Name</Label>
                  <Input
                    id="edit-name"
                    value={editingRole.name}
                    onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                    disabled={editingRole.isSystem}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-color">Color</Label>
                  <select
                    value={editingRole.color}
                    onChange={(e) => setEditingRole({...editingRole, color: e.target.value})}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white"
                    disabled={editingRole.isSystem}
                  >
                    <option value="bg-blue-600">Blue</option>
                    <option value="bg-green-600">Green</option>
                    <option value="bg-purple-600">Purple</option>
                    <option value="bg-yellow-600">Yellow</option>
                    <option value="bg-red-600">Red</option>
                    <option value="bg-pink-600">Pink</option>
                    <option value="bg-indigo-600">Indigo</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({...editingRole, description: e.target.value})}
                  className="bg-white/10 border-white/20 text-white"
                  rows={3}
                  disabled={editingRole.isSystem}
                />
              </div>

              {/* Role Statistics */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{editingRole.userCount}</p>
                  <p className="text-sm text-gray-400">Users Assigned</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{getPermissionCount(editingRole.permissions)}</p>
                  <p className="text-sm text-gray-400">Permissions</p>
                </div>
                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full ${editingRole.color} mx-auto mb-1`}></div>
                  <p className="text-sm text-gray-400">Role Color</p>
                </div>
              </div>
              
              <Separator className="bg-white/10" />
              
              <div>
                <h4 className="text-lg font-medium text-white mb-4">
                  Permissions {editingRole.isSystem && "(Read Only)"}
                </h4>
                <PermissionMatrix 
                  roleData={editingRole} 
                  setRoleData={setEditingRole} 
                  readOnly={editingRole.isSystem}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  {editingRole.isSystem ? 'Close' : 'Cancel'}
                </Button>
                {!editingRole.isSystem && (
                  <Button onClick={handleUpdateRole} className="bg-blue-600 hover:bg-blue-700">
                    Update Role
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
