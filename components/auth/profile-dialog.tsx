"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Activity, Zap, ImageIcon, Clock, CheckCircle } from "lucide-react"

interface ProfileDialogProps {
  user: {
    id: string
    email: string
    name: string
  }
  isOpen: boolean
  onClose: () => void
  onUpdateProfile: (updates: { name: string; email: string }) => void
  completedJobs?: number
  totalProcessingTime?: string
}

export function ProfileDialog({
  user,
  isOpen,
  onClose,
  onUpdateProfile,
  completedJobs = 0,
  totalProcessingTime = "0m",
}: ProfileDialogProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  })
  const [isEditing, setIsEditing] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSave = () => {
    onUpdateProfile(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({ name: user.name, email: user.email })
    setIsEditing(false)
  }

  // Mock user stats
  const userStats = {
    joinDate: "January 2024",
    imagesEnhanced: completedJobs,
    totalProcessingTime: totalProcessingTime,
    favoriteModel: "Real-ESRGAN 4x",
    accountType: "Free",
    creditsUsed: completedJobs * 10,
    creditsRemaining: 1000 - completedJobs * 10,
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black/90 backdrop-blur-lg border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Profile Settings</DialogTitle>
          <DialogDescription className="text-gray-400">
            Manage your account settings and view your usage statistics
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5">
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600">
              Profile
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-blue-600">
              Statistics
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-blue-600">
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 bg-blue-600">
                <AvatarFallback className="bg-blue-600 text-white text-xl">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-gray-400">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                  <Badge variant="outline" className="border-blue-500/20 text-blue-400">
                    {userStats.accountType}
                  </Badge>
                </div>
              </div>
            </div>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Personal Information</CardTitle>
                <CardDescription className="text-gray-400">Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10 bg-white/10 border-white/20 text-white disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10 bg-white/10 border-white/20 text-white disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        Save Changes
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{userStats.imagesEnhanced}</p>
                      <p className="text-xs text-gray-400">Images Enhanced</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{userStats.totalProcessingTime}</p>
                      <p className="text-xs text-gray-400">Processing Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{userStats.creditsUsed}</p>
                      <p className="text-xs text-gray-400">Credits Used</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{userStats.creditsRemaining}</p>
                      <p className="text-xs text-gray-400">Credits Left</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Member since:</span>
                  <span className="text-white">{userStats.joinDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account type:</span>
                  <Badge variant="outline" className="border-blue-500/20 text-blue-400">
                    {userStats.accountType}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Favorite model:</span>
                  <span className="text-white">{userStats.favoriteModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">User ID:</span>
                  <span className="text-gray-300 font-mono text-sm">{user.id}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Current Plan</CardTitle>
                <CardDescription className="text-gray-400">You are currently on the Free plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Plan:</span>
                    <Badge variant="outline" className="border-green-500/20 text-green-400">
                      Free
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Credits remaining:</span>
                    <span className="text-white font-semibold">{userStats.creditsRemaining}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Next billing date:</span>
                    <span className="text-gray-400">N/A</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Upgrade to Pro
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Usage This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Images processed:</span>
                    <span className="text-white">{userStats.imagesEnhanced}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Credits used:</span>
                    <span className="text-white">{userStats.creditsUsed}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(userStats.creditsUsed / 1000) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400">{userStats.creditsUsed} of 1000 credits used</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
