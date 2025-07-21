"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Database,
  PenToolIcon as Tool,
  ArrowRight,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

interface DatabaseHealthResult {
  connection: boolean
  tables: Record<string, boolean>
  views: Record<string, boolean>
  issues: DatabaseIssue[]
  overallHealth: "healthy" | "warning" | "unhealthy" | "critical" | "unknown"
}

interface DatabaseIssue {
  type: "connection" | "missing_table" | "missing_view" | "schema_issue" | "data_integrity" | "unknown"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  autoFixable: boolean
  tableName?: string
  viewName?: string
  missingColumns?: string[]
  details?: any
}

interface AutoFixResult {
  fixed: Array<{
    issue: DatabaseIssue
  }>
  failed: Array<{
    issue: DatabaseIssue
    reason: string
  }>
  skipped: Array<{
    issue: DatabaseIssue
    reason: string
  }>
}

export default function DatabaseHealthDashboard() {
  const [health, setHealth] = useState<DatabaseHealthResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [fixingIssues, setFixingIssues] = useState(false)
  const [fixResult, setFixResult] = useState<AutoFixResult | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    checkDatabaseHealth()
  }, [])

  const checkDatabaseHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/database/health")
      const data = await response.json()

      if (data.success && data.health) {
        setHealth(data.health)
      } else {
        toast({
          title: "Error checking database health",
          description: data.error || "Unknown error",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error checking database health",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const autoFixIssues = async () => {
    if (!health?.issues || health.issues.length === 0) return

    setFixingIssues(true)
    try {
      const response = await fetch("/api/database/fix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issues: health.issues.filter((issue) => issue.autoFixable),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setFixResult(data.fixResult)
        setHealth(data.currentHealth)

        toast({
          title: "Auto-fix completed",
          description: `Fixed: ${data.fixResult.fixed.length}, Failed: ${data.fixResult.failed.length}, Skipped: ${data.fixResult.skipped.length}`,
          variant: "default",
        })
      } else {
        toast({
          title: "Auto-fix failed",
          description: data.error || "Unknown error",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Auto-fix failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setFixingIssues(false)
    }
  }

  const createProcedures = async () => {
    try {
      const response = await fetch("/api/database/procedures", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Database procedures created successfully",
          variant: "default",
        })
      } else {
        toast({
          title: "Error creating procedures",
          description: data.error || "Unknown error",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error creating procedures",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  const runMigration = async (version: string) => {
    try {
      const response = await fetch("/api/database/migrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ version }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Migration successful",
          description: `Migration ${version} applied successfully`,
          variant: "default",
        })

        // Refresh health check
        checkDatabaseHealth()
      } else {
        toast({
          title: "Migration failed",
          description: data.error || "Unknown error",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Migration failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />
      case "unhealthy":
        return <AlertCircle className="h-6 w-6 text-orange-500" />
      case "critical":
        return <AlertCircle className="h-6 w-6 text-red-500" />
      default:
        return <Info className="h-6 w-6 text-blue-500" />
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "unhealthy":
        return "bg-orange-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Low
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getFixableBadge = (autoFixable: boolean) => {
    return autoFixable ? (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
        Auto-fixable
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
        Manual fix
      </Badge>
    )
  }

  const countIssuesBySeverity = (severity: string) => {
    return health?.issues.filter((issue) => issue.severity === severity).length || 0
  }

  const countAutoFixableIssues = () => {
    return health?.issues.filter((issue) => issue.autoFixable).length || 0
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Database Health Dashboard</h1>
        <Button onClick={checkDatabaseHealth} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {health ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="issues">Issues {health.issues.length > 0 && `(${health.issues.length})`}</TabsTrigger>
            <TabsTrigger value="tables">Tables & Views</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    {getHealthIcon(health.overallHealth)}
                    <span className="text-2xl font-bold capitalize">{health.overallHealth}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    {health.connection ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    )}
                    <span className="text-2xl font-bold">{health.connection ? "Connected" : "Disconnected"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <span className="font-bold">
                        {Object.values(health.tables).filter(Boolean).length}/{Object.keys(health.tables).length}
                      </span>
                    </div>
                    <Progress
                      value={
                        (Object.values(health.tables).filter(Boolean).length / Object.keys(health.tables).length) * 100
                      }
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <span className="font-bold">
                        {Object.values(health.views).filter(Boolean).length}/{Object.keys(health.views).length}
                      </span>
                    </div>
                    <Progress
                      value={
                        (Object.values(health.views).filter(Boolean).length / Object.keys(health.views).length) * 100
                      }
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Issues Summary</CardTitle>
                  <CardDescription>Overview of detected issues by severity</CardDescription>
                </CardHeader>
                <CardContent>
                  {health.issues.length === 0 ? (
                    <div className="flex items-center justify-center p-6">
                      <div className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No issues detected</h3>
                        <p className="text-sm text-gray-500">Your database is healthy and ready to use</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-md">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          <div>
                            <div className="text-sm font-medium">Critical</div>
                            <div className="text-2xl font-bold">{countIssuesBySeverity("critical")}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-md">
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                          <div>
                            <div className="text-sm font-medium">High</div>
                            <div className="text-2xl font-bold">{countIssuesBySeverity("high")}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-md">
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          <div>
                            <div className="text-sm font-medium">Medium</div>
                            <div className="text-2xl font-bold">{countIssuesBySeverity("medium")}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md">
                          <Info className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="text-sm font-medium">Low</div>
                            <div className="text-2xl font-bold">{countIssuesBySeverity("low")}</div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Auto-fixable issues:</span>
                          <span className="font-bold">
                            {countAutoFixableIssues()}/{health.issues.length}
                          </span>
                        </div>
                        <Progress value={(countAutoFixableIssues() / health.issues.length) * 100} className="h-2" />
                      </div>

                      {countAutoFixableIssues() > 0 && (
                        <Button onClick={autoFixIssues} disabled={fixingIssues} className="w-full">
                          <Tool className="h-4 w-4 mr-2" />
                          {fixingIssues ? "Fixing Issues..." : `Auto-fix ${countAutoFixableIssues()} Issues`}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fix History</CardTitle>
                  <CardDescription>Results of the last auto-fix operation</CardDescription>
                </CardHeader>
                <CardContent>
                  {!fixResult ? (
                    <div className="flex items-center justify-center p-6">
                      <div className="text-center">
                        <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No fix history</h3>
                        <p className="text-sm text-gray-500">Run auto-fix to see results here</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-3 bg-green-50 rounded-md">
                          <div className="text-sm font-medium">Fixed</div>
                          <div className="text-2xl font-bold text-green-600">{fixResult.fixed.length}</div>
                        </div>
                        <div className="p-3 bg-red-50 rounded-md">
                          <div className="text-sm font-medium">Failed</div>
                          <div className="text-2xl font-bold text-red-600">{fixResult.failed.length}</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="text-sm font-medium">Skipped</div>
                          <div className="text-2xl font-bold text-gray-600">{fixResult.skipped.length}</div>
                        </div>
                      </div>

                      {fixResult.fixed.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Fixed Issues:</h4>
                          <ul className="text-sm space-y-1">
                            {fixResult.fixed.map((item, i) => (
                              <li key={i} className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                {item.issue.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {fixResult.failed.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Failed Fixes:</h4>
                          <ul className="text-sm space-y-1">
                            {fixResult.failed.map((item, i) => (
                              <li key={i} className="flex items-start">
                                <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                                <div>
                                  <div>{item.issue.message}</div>
                                  <div className="text-xs text-red-600">{item.reason}</div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4 mt-4">
            {health.issues.length === 0 ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <AlertTitle>No issues detected</AlertTitle>
                <AlertDescription>Your database is healthy and ready to use.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Issues ({health.issues.length})</h2>
                  {countAutoFixableIssues() > 0 && (
                    <Button onClick={autoFixIssues} disabled={fixingIssues}>
                      <Tool className="h-4 w-4 mr-2" />
                      {fixingIssues ? "Fixing Issues..." : `Auto-fix ${countAutoFixableIssues()} Issues`}
                    </Button>
                  )}
                </div>

                <Accordion type="multiple" className="space-y-2">
                  {health.issues.map((issue, i) => (
                    <AccordionItem key={i} value={`issue-${i}`} className="border rounded-md">
                      <AccordionTrigger className="px-4 py-2 hover:no-underline">
                        <div className="flex items-center space-x-2 text-left">
                          <div className={`w-2 h-2 rounded-full ${getHealthColor(issue.severity)}`} />
                          <span>{issue.message}</span>
                          <div className="ml-auto flex space-x-2">
                            {getSeverityBadge(issue.severity)}
                            {getFixableBadge(issue.autoFixable)}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3 pt-1">
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium">Type:</span>
                            <span className="ml-2 capitalize">{issue.type.replace(/_/g, " ")}</span>
                          </div>

                          {issue.tableName && (
                            <div>
                              <span className="text-sm font-medium">Table:</span>
                              <span className="ml-2">{issue.tableName}</span>
                            </div>
                          )}

                          {issue.viewName && (
                            <div>
                              <span className="text-sm font-medium">View:</span>
                              <span className="ml-2">{issue.viewName}</span>
                            </div>
                          )}

                          {issue.missingColumns && issue.missingColumns.length > 0 && (
                            <div>
                              <span className="text-sm font-medium">Missing Columns:</span>
                              <div className="ml-2 mt-1">
                                {issue.missingColumns.map((col, i) => (
                                  <Badge key={i} variant="outline" className="mr-1 mb-1">
                                    {col}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {issue.autoFixable && (
                            <Button size="sm" onClick={() => autoFixIssues()} disabled={fixingIssues}>
                              <Tool className="h-4 w-4 mr-2" />
                              {fixingIssues ? "Fixing..." : "Fix Issue"}
                            </Button>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tables" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tables</CardTitle>
                  <CardDescription>Database tables status</CardDescription>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {Object.entries(health.tables).map(([tableName, exists]) => (
                      <div key={tableName} className="flex items-center justify-between p-2 border rounded-md">
                        <span className="font-mono text-sm">{tableName}</span>
                        {exists ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                            Missing
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Views</CardTitle>
                  <CardDescription>Database views status</CardDescription>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {Object.entries(health.views).map(([viewName, exists]) => (
                      <div key={viewName} className="flex items-center justify-between p-2 border rounded-md">
                        <span className="font-mono text-sm">{viewName}</span>
                        {exists ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                            Missing
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Database Migrations</CardTitle>
                  <CardDescription>Apply database migrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Migration 1.0.0</span>
                        <Button size="sm" onClick={() => runMigration("1.0.0")}>
                          Apply <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">Initial database setup with core tables</p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Migration 1.0.1</span>
                        <Button size="sm" onClick={() => runMigration("1.0.1")}>
                          Apply <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">Add user preferences columns</p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Migration 1.0.2</span>
                        <Button size="sm" onClick={() => runMigration("1.0.2")}>
                          Apply <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">Add model performance metrics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database Tools</CardTitle>
                  <CardDescription>Maintenance and repair tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full bg-transparent" variant="outline" onClick={createProcedures}>
                      <Database className="mr-2 h-4 w-4" />
                      Create Database Procedures
                    </Button>

                    <Button className="w-full bg-transparent" variant="outline" onClick={checkDatabaseHealth}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Database Health
                    </Button>

                    {countAutoFixableIssues() > 0 && (
                      <Button className="w-full" onClick={autoFixIssues} disabled={fixingIssues}>
                        <Tool className="mr-2 h-4 w-4" />
                        {fixingIssues ? "Fixing Issues..." : "Auto-fix All Issues"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-medium">Checking database health...</h3>
            <p className="text-sm text-gray-500">This may take a few moments</p>
          </div>
        </div>
      )}
    </div>
  )
}
