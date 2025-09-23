"use client"

import { useState } from "react"
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Activity,
  MoreHorizontal,
  UserCheck,
  UserX,
  Crown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Mock user data - in a real app, this would come from your database
const mockUsers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    status: "active",
    lastLogin: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    enhancementsCount: 156,
    storageUsed: "2.4 GB",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 2,
    name: "Demo User",
    email: "demo@example.com",
    role: "user",
    status: "active",
    lastLogin: "2024-01-14T15:45:00Z",
    createdAt: "2024-01-05T00:00:00Z",
    enhancementsCount: 23,
    storageUsed: "456 MB",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 3,
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    status: "active",
    lastLogin: "2024-01-13T09:15:00Z",
    createdAt: "2024-01-10T00:00:00Z",
    enhancementsCount: 8,
    storageUsed: "124 MB",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 4,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "moderator",
    status: "suspended",
    lastLogin: "2024-01-12T14:20:00Z",
    createdAt: "2024-01-08T00:00:00Z",
    enhancementsCount: 45,
    storageUsed: "890 MB",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 5,
    name: "Bob Wilson",
    email: "bob@example.com",
    role: "user",
    status: "inactive",
    lastLogin: "2024-01-05T11:30:00Z",
    createdAt: "2024-01-03T00:00:00Z",
    enhancementsCount: 2,
    storageUsed: "45 MB",
    avatar: "/placeholder-user.jpg",
  },
]

const roles = [
  { id: "admin", name: "Administrator", color: "bg-red-600" },
  { id: "moderator", name: "Moderator", color: "bg-yellow-600" },
  { id: "user", name: "User", color: "bg-blue-600" },
]

export function UserManagement({ currentUser }) {
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user",
    status: "active",
    password: "",
    notes: "",
  })

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  // User statistics
  const userStats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    suspended: users.filter((u) => u.status === "suspended").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    admins: users.filter((u) => u.role === "admin").length,
    moderators: users.filter((u) => u.role === "moderator").length,
    regularUsers: users.filter((u) => u.role === "user").length,
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRoleColor = (role) => {
    const roleObj = roles.find((r) => r.id === role)
    return roleObj?.color || "bg-gray-600"
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "n3uralia-badge-gold"
      case "suspended":
        return "bg-red-600"
      case "inactive":
        return "bg-gray-600"
      default:
        return "bg-gray-600"
    }
  }

  const handleCreateUser = () => {
    const user = {
      id: Math.max(...users.map((u) => u.id)) + 1,
      ...newUser,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      enhancementsCount: 0,
      storageUsed: "0 MB",
      avatar: "/placeholder-user.jpg",
    }
    setUsers([...users, user])
    setNewUser({
      name: "",
      email: "",
      role: "user",
      status: "active",
      password: "",
      notes: "",
    })
    setShowCreateDialog(false)
  }

  const handleEditUser = (user) => {
    setEditingUser({ ...user })
    setShowEditDialog(true)
  }

  const handleUpdateUser = () => {
    setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)))
    setShowEditDialog(false)
    setEditingUser(null)
  }

  const handleDeleteUser = (userId) => {
    if (userId === currentUser?.id) {
      alert("You cannot delete your own account")
      return
    }
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== userId))
    }
  }

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) return

    switch (action) {
      case "activate":
        setUsers(users.map((u) => (selectedUsers.includes(u.id) ? { ...u, status: "active" } : u)))
        break
      case "suspend":
        setUsers(
          users.map((u) =>
            selectedUsers.includes(u.id) && u.id !== currentUser?.id ? { ...u, status: "suspended" } : u,
          ),
        )
        break
      case "delete":
        if (confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
          setUsers(users.filter((u) => !selectedUsers.includes(u.id) || u.id === currentUser?.id))
        }
        break
    }
    setSelectedUsers([])
  }

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id))
    }
  }

  return (
    <div className="space-y-8">
      {/* User Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="n3uralia-card group">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 icon-monochrome group-hover:text-gold transition-colors" />
              <div>
                <p className="text-sm n3uralia-text-muted">Total Users</p>
                <p className="text-2xl font-bold text-white">{userStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="n3uralia-card group">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 icon-monochrome group-hover:text-gold transition-colors" />
              <div>
                <p className="text-sm n3uralia-text-muted">Active</p>
                <p className="text-2xl font-bold text-white">{userStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="n3uralia-card group">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 icon-monochrome group-hover:text-gold transition-colors" />
              <div>
                <p className="text-sm n3uralia-text-muted">Admins</p>
                <p className="text-2xl font-bold text-white">{userStats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="n3uralia-card group">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="w-5 h-5 icon-monochrome group-hover:text-gold transition-colors" />
              <div>
                <p className="text-sm n3uralia-text-muted">Suspended</p>
                <p className="text-2xl font-bold text-white">{userStats.suspended}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="n3uralia-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 icon-monochrome" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 n3uralia-input"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32 n3uralia-select">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 n3uralia-select">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {selectedUsers.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="n3uralia-button-secondary bg-transparent">
                      Bulk Actions ({selectedUsers.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-800 border-white/20">
                    <DropdownMenuItem onClick={() => handleBulkAction("activate")}>
                      <UserCheck className="w-4 h-4 mr-2 icon-monochrome" />
                      Activate Users
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction("suspend")}>
                      <UserX className="w-4 h-4 mr-2 icon-monochrome" />
                      Suspend Users
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction("delete")} className="text-red-400">
                      <Trash2 className="w-4 h-4 mr-2 icon-monochrome" />
                      Delete Users
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="n3uralia-button-gold">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-white/20 text-white">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          className="n3uralia-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          className="n3uralia-input"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                          <SelectTrigger className="n3uralia-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/20">
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={newUser.status}
                          onValueChange={(value) => setNewUser({ ...newUser, status: value })}
                        >
                          <SelectTrigger className="n3uralia-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/20">
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="n3uralia-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newUser.notes}
                        onChange={(e) => setNewUser({ ...newUser, notes: e.target.value })}
                        className="n3uralia-input"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateDialog(false)}
                        className="n3uralia-button-secondary"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateUser} className="n3uralia-button-gold">
                        Create User
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="n3uralia-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b n3uralia-border">
                <tr>
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={selectAllUsers}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left p-4 n3uralia-text-muted font-medium">User</th>
                  <th className="text-left p-4 n3uralia-text-muted font-medium">Role</th>
                  <th className="text-left p-4 n3uralia-text-muted font-medium">Status</th>
                  <th className="text-left p-4 n3uralia-text-muted font-medium">Activity</th>
                  <th className="text-left p-4 n3uralia-text-muted font-medium">Usage</th>
                  <th className="text-left p-4 n3uralia-text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 group">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-sm n3uralia-text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getRoleColor(user.role)} text-white`}>
                        {roles.find((r) => r.id === user.role)?.name}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(user.status)} text-white`}>{user.status}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-white">{user.lastLogin ? formatDate(user.lastLogin) : "Never"}</p>
                        <p className="n3uralia-text-muted">Joined {formatDate(user.createdAt)}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-white">{user.enhancementsCount} enhancements</p>
                        <p className="n3uralia-text-muted">{user.storageUsed} used</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="icon-monochrome hover:text-gold">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-slate-800 border-white/20">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="w-4 h-4 mr-2 icon-monochrome" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2 icon-monochrome" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Activity className="w-4 h-4 mr-2 icon-monochrome" />
                            View Activity
                          </DropdownMenuItem>
                          {user.id !== currentUser?.id && (
                            <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-400">
                              <Trash2 className="w-4 h-4 mr-2 icon-monochrome" />
                              Delete User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 icon-monochrome mx-auto mb-4" />
              <p className="n3uralia-text-muted">No users found</p>
              <p className="text-sm n3uralia-text-muted mt-2">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first user to get started"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-slate-800 border-white/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="n3uralia-input"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="n3uralia-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                  >
                    <SelectTrigger className="n3uralia-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingUser.status}
                    onValueChange={(value) => setEditingUser({ ...editingUser, status: value })}
                  >
                    <SelectTrigger className="n3uralia-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* User Statistics */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{editingUser.enhancementsCount}</p>
                  <p className="text-sm n3uralia-text-muted">Enhancements</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{editingUser.storageUsed}</p>
                  <p className="text-sm n3uralia-text-muted">Storage Used</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">
                    {editingUser.lastLogin ? formatDate(editingUser.lastLogin) : "Never"}
                  </p>
                  <p className="text-sm n3uralia-text-muted">Last Login</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="n3uralia-button-secondary"
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser} className="n3uralia-button-gold">
                  Update User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
