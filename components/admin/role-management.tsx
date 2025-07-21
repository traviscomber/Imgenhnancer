"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  Crown,
  User,
  Plus,
  Edit,
  Trash2,
  Settings,
  Users,
  ImageIcon,
  Database,
  Activity,
  Key,
  AlertTriangle,
} from "lucide-react"

// Permission categories and definitions
const permissionCategories = {
  system: {
    name: "System Administration",
    icon: Settings,
    permissions: [
      { id: "system.admin", name: "System Administration", description: "Full system access and configuration" },
      { id: "system.config", name: "System Configuration", description: "Modify system settings and parameters" },
      { id: "system.logs", name: "View System Logs", description: "Access system logs and monitoring data" },
    ],
  },
  users: {
    name: "User Management",
    icon: Users,
    permissions: [
      { id: "users.view", name: "View Users", description: "View user accounts and profiles" },
      { id: "users.create", name: "Create Users", description: "Create new user accounts" },
      { id: "users.edit", name: "Edit Users", description: "Modify user accounts and profiles" },
      { id: "users.delete", name: "Delete Users", description: "Delete user accounts" },
      { id: "users.roles", name: "Manage Roles", description: "Assign and modify user roles" },
    ],
  },
  images: {
    name: "Image Processing",
    icon: ImageIcon,
    permissions: [
      { id: "images.upload", name: "Upload Images", description: "Upload images for enhancement" },
      { id: "images.enhance", name: "Enhance Images", description: "Process and enhance images" },
      { id: "images.download", name: "Download Images", description: "Download enhanced images" },
      { id: "images.view_all", name: "View All Images", description: "View all user images (admin)" },
      { id: "images.delete_any", name: "Delete Any Image", description: "Delete any user's images" },
    ],
  },
  models: {
    name: "AI Models",
    icon: Database,
    permissions: [
      { id: "models.view", name: "View Models", description: "View available AI models" },
      { id: "models.configure", name: "Configure Models", description: "Configure AI model settings" },
      { id: "models.test", name: "Test Models", description: "Test and validate AI models" },
      { id: "models.discover", name: "Discover Models", description: "Discover new AI models" },
    ],
  },
  analytics: {
    name: "Analytics & Reports",
    icon: Activity,
    permissions: [
      { id: "analytics.view", name: "View Analytics", description: "View system analytics and reports" },
      { id: "analytics.export", name: "Export Reports", description: "Export analytics and usage reports" },
      { id: "analytics.users", name: "User Analytics", description: "View detailed user analytics" },
    ],
  },
}

// Default role definitions
const defaultRoles = [
  {
    id: "user",
    name: "User",
    description: "Basic user with image enhancement capabilities",
    color: "bg-blue-600",
    icon: User,
    permissions: ["images.upload", "images.enhance", "images.download", "models.view"],
    isSystem: true,
  },
  {
    id: "moderator",
    name: "Moderator",
    description: "Can moderate content and assist users",
    color: "bg-purple-600",
    icon: Shield,
    permissions: [
      "images.upload",
      "images.enhance",
      "images.download",
      "images.view_all",
      "models.view",
      "models.test",
      "users.view",
      "analytics.view",
    ],
    isSystem: true,
  },
  {
    id: "admin",
    name: "Administrator",
    description: "Full system access and user management",
    color: "bg-red-600",
    icon: Crown,
    permissions: Object.values(permissionCategories).flatMap((cat) => cat.permissions.map((p) => p.id)),
    isSystem: true,
  },
]

export function RoleManagement() {
  const [roles, setRoles] = useState(defaultRoles)
  const [selectedRole, setSelectedRole] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    color: "bg-blue-600",
    permissions: [],
  })

  const handleEditRole = (role) => {
    setSelectedRole(role)
    setEditForm({
      name: role.name,
      description: role.description,
      color: role.color,
      permissions: [...role.permissions],
    })
    setIsEditDialogOpen(true)
  }

  const handleCreateRole = () => {
    setEditForm({
      name: "",
      description: "",
      color: "bg-blue-600",
      permissions: [],
    })
    setIsCreateDialogOpen(true)
  }

  const handleSaveRole = () => {
    if (selectedRole) {
      // Edit existing role
      setRoles(roles.map((role) => (role.id === selectedRole.id ? { ...role, ...editForm } : role)))
    } else {
      // Create new role
      const newRole = {
        id: editForm.name.toLowerCase().replace(/\s+/g, "-"),
        ...editForm,
        icon: Shield,
        isSystem: false,
      }
      setRoles([...roles, newRole])
    }
    setIsEditDialogOpen(false)
    setIsCreateDialogOpen(false)
    setSelectedRole(null)
  }

  const handleDeleteRole = (roleId) => {
    const role = roles.find((r) => r.id === roleId)
    if (role?.isSystem) {
      alert("Cannot delete system roles")
      return
    }
    if (confirm("Are you sure you want to delete this role?")) {
      setRoles(roles.filter((role) => role.id !== roleId))
    }
  }

  const togglePermission = (permissionId) => {
    setEditForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  const getRoleIcon = (role) => {
    const IconComponent = role.icon
    return <IconComponent className="w-4 h-4" />
  }

  const getPermissionCount = (role) => {
    return role.permissions.length
  }

  const getTotalPermissions = () => {
    return Object.values(permissionCategories).reduce((total, cat) => total + cat.permissions.length, 0)
  }

  return (
    <div className="space-y-8">
      {/* Role Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{roles.length}</p>
                <p className="text-xs text-gray-400">Total Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{getTotalPermissions()}</p>
                <p className="text-xs text-gray-400">Total Permissions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{roles.filter((r) => !r.isSystem).length}</p>
                <p className="text-xs text-gray-400">Custom Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Management */}
      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Role Management</CardTitle>
              <CardDescription className="text-gray-400">
                Configure roles and permissions for your users
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreateRole} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {roles.map((role) => (
              <div key={role.id} className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${role.color} rounded-lg flex items-center justify-center`}>
                      {getRoleIcon(role)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-white">{role.name}</h3>
                        {role.isSystem && (
                          <Badge variant="outline" className="border-yellow-500/20 text-yellow-400 text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{role.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getPermissionCount(role)} of {getTotalPermissions()} permissions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRole(role)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    {!role.isSystem && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                        className="border-red-500/20 text-red-400 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>

                {/* Permission Preview */}
                <div className="space-y-3">
                  {Object.entries(permissionCategories).map(([categoryKey, category]) => {
                    const categoryPermissions = category.permissions.filter((p) => role.permissions.includes(p.id))

                    if (categoryPermissions.length === 0) return null

                    return (
                      <div key={categoryKey} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <category.icon className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium text-white">{category.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {categoryPermissions.length}/{category.permissions.length}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {categoryPermissions.map((permission) => (
                            <Badge
                              key={permission.id}
                              variant="outline"
                              className="border-blue-500/20 text-blue-400 text-xs"
                            >
                              {permission.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit/Create Role Dialog */}
      <Dialog
        open={isEditDialogOpen || isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditDialogOpen(false)
            setIsCreateDialogOpen(false)
            setSelectedRole(null)
          }
        }}
      >
        <DialogContent className="max-w-4xl bg-black/90 backdrop-blur-lg border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{selectedRole ? `Edit Role: ${selectedRole.name}` : "Create New Role"}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedRole ? "Modify role settings and permissions" : "Create a new role with custom permissions"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Enter role name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-color">Role Color</Label>
                <select
                  id="role-color"
                  value={editForm.color}
                  onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="bg-blue-600">Blue</option>
                  <option value="bg-purple-600">Purple</option>
                  <option value="bg-green-600">Green</option>
                  <option value="bg-red-600">Red</option>
                  <option value="bg-yellow-600">Yellow</option>
                  <option value="bg-pink-600">Pink</option>
                  <option value="bg-indigo-600">Indigo</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Describe this role's purpose and responsibilities"
                rows={3}
              />
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg">Permissions</Label>
                <div className="text-sm text-gray-400">
                  {editForm.permissions.length} of {getTotalPermissions()} selected
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(permissionCategories).map(([categoryKey, category]) => (
                  <div key={categoryKey} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <category.icon className="w-5 h-5 text-blue-400" />
                      <h4 className="font-medium text-white">{category.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {category.permissions.filter((p) => editForm.permissions.includes(p.id)).length}/
                        {category.permissions.length}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {category.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h5 className="text-sm font-medium text-white">{permission.name}</h5>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{permission.description}</p>
                          </div>
                          <Switch
                            checked={editForm.permissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Role Warning */}
            {selectedRole?.isSystem && (
              <Alert className="bg-yellow-900/20 border-yellow-500/20">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-yellow-400">
                  This is a system role. Changes may affect core functionality.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2">
              <Button onClick={handleSaveRole} className="bg-blue-600 hover:bg-blue-700">
                {selectedRole ? "Save Changes" : "Create Role"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setIsCreateDialogOpen(false)
                  setSelectedRole(null)
                }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
