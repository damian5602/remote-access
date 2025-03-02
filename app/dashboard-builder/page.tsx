"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Responsive, WidthProvider } from "react-grid-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Save, Plus, Trash, ArrowLeft, Thermometer, Droplets, ToggleLeft, Gauge } from "lucide-react"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import type { DashboardWidget } from "@/types/dashboard"

const ResponsiveGridLayout = WidthProvider(Responsive)

const dashboardFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  userId: z.string().optional(),
})

const widgetFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  type: z.string().min(1, { message: "Please select a widget type" }),
  deviceId: z.string().min(1, { message: "Please select a device" }),
})

export default function DashboardBuilderPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(true)
  const [dashboardId, setDashboardId] = useState<string | null>(null)
  const [dashboardName, setDashboardName] = useState("")
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const [devices, setDevices] = useState<{ id: string; name: string }[]>([])
  const [isDashboardDialogOpen, setIsDashboardDialogOpen] = useState(false)
  const [isWidgetDialogOpen, setIsWidgetDialogOpen] = useState(false)

  const dashboardForm = useForm<z.infer<typeof dashboardFormSchema>>({
    resolver: zodResolver(dashboardFormSchema),
    defaultValues: {
      name: "",
      userId: "",
    },
  })

  const widgetForm = useForm<z.infer<typeof widgetFormSchema>>({
    resolver: zodResolver(widgetFormSchema),
    defaultValues: {
      title: "",
      type: "",
      deviceId: "",
    },
  })

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/dashboard")
        return
      }
      fetchUsers()
      fetchDevices()
      setIsLoading(false)
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  const fetchUsers = async () => {
    try {
      // This would be a real API call in production
      // const response = await fetch("/api/users")
      // const data = await response.json()

      // Mock data for demonstration
      const mockUsers = [
        { id: "1", name: "Admin User" },
        { id: "2", name: "Test User" },
      ]

      setUsers(mockUsers)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load users",
        description: "Please try again later.",
      })
    }
  }

  const fetchDevices = async () => {
    try {
      // This would be a real API call in production
      // const response = await fetch("/api/devices")
      // const data = await response.json()

      // Mock data for demonstration
      const mockDevices = [
        { id: "1", name: "Temperature Sensor" },
        { id: "2", name: "Humidity Sensor" },
        { id: "3", name: "Light Switch" },
      ]

      setDevices(mockDevices)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load devices",
        description: "Please try again later.",
      })
    }
  }

  const onDashboardSubmit = async (values: z.infer<typeof dashboardFormSchema>) => {
    try {
      // This would be a real API call in production
      // const response = await fetch("/api/dashboards", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(values),
      // })
      // const data = await response.json()

      // Mock response for demonstration
      const mockDashboard = {
        id: Date.now().toString(),
        name: values.name,
        userId: values.userId || null,
      }

      setDashboardId(mockDashboard.id)
      setDashboardName(mockDashboard.name)
      setWidgets([])
      setIsDashboardDialogOpen(false)

      toast({
        title: "Dashboard created",
        description: "New dashboard has been created successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create dashboard",
        description: "Please try again later.",
      })
    }
  }

  const onWidgetSubmit = async (values: z.infer<typeof widgetFormSchema>) => {
    try {
      // Generate a new widget
      const newWidget: DashboardWidget = {
        id: Date.now().toString(),
        type: values.type,
        title: values.title,
        deviceId: values.deviceId,
        x: 0,
        y: widgets.length > 0 ? Math.max(...widgets.map((w) => w.y)) + 2 : 0,
        w: 2,
        h: 2,
        minW: 1,
        minH: 1,
        data: getDefaultDataForWidgetType(values.type),
      }

      setWidgets([...widgets, newWidget])
      setIsWidgetDialogOpen(false)
      widgetForm.reset()

      toast({
        title: "Widget added",
        description: "New widget has been added to the dashboard.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add widget",
        description: "Please try again later.",
      })
    }
  }

  const getDefaultDataForWidgetType = (type: string) => {
    switch (type) {
      case "temperature":
        return { value: 0, unit: "°C" }
      case "humidity":
        return { value: 0, unit: "%" }
      case "switch":
        return { state: false }
      case "gauge":
        return { value: 0, min: 0, max: 100, unit: "" }
      default:
        return {}
    }
  }

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case "temperature":
        return <Thermometer className="h-6 w-6" />
      case "humidity":
        return <Droplets className="h-6 w-6" />
      case "switch":
        return <ToggleLeft className="h-6 w-6" />
      case "gauge":
        return <Gauge className="h-6 w-6" />
      default:
        return null
    }
  }

  const handleLayoutChange = (layout: any) => {
    const updatedWidgets = widgets.map((widget) => {
      const layoutItem = layout.find((item: any) => item.i === widget.id)
      if (layoutItem) {
        return {
          ...widget,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
        }
      }
      return widget
    })

    setWidgets(updatedWidgets)
  }

  const handleDeleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter((widget) => widget.id !== widgetId))
  }

  const handleSaveDashboard = async () => {
    if (!dashboardId) {
      toast({
        variant: "destructive",
        title: "No dashboard selected",
        description: "Please create a dashboard first.",
      })
      return
    }

    try {
      // This would be a real API call in production
      // await fetch(`/api/dashboards/${dashboardId}`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ widgets }),
      // })

      toast({
        title: "Dashboard saved",
        description: "Dashboard has been saved successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to save dashboard",
        description: "Please try again later.",
      })
    }
  }

  const handlePreview = () => {
    setIsEditing(false)
  }

  const handleBackToEdit = () => {
    setIsEditing(true)
  }

  if (isLoading) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Builder</CardTitle>
            <CardDescription>Create and customize dashboards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] flex items-center justify-center">
              <p>Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{dashboardId ? dashboardName : "Dashboard Builder"}</CardTitle>
            <CardDescription>
              {isEditing
                ? "Drag and drop widgets to create a custom dashboard"
                : "Preview mode - see how your dashboard will look for users"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {dashboardId ? (
              <>
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handlePreview}>
                      Preview
                    </Button>
                    <Dialog open={isWidgetDialogOpen} onOpenChange={setIsWidgetDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Widget
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Widget</DialogTitle>
                          <DialogDescription>Add a new widget to your dashboard</DialogDescription>
                        </DialogHeader>
                        <Form {...widgetForm}>
                          <form onSubmit={widgetForm.handleSubmit(onWidgetSubmit)} className="space-y-4">
                            <FormField
                              control={widgetForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Widget Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Temperature Sensor" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={widgetForm.control}
                              name="type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Widget Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select widget type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="temperature">Temperature</SelectItem>
                                      <SelectItem value="humidity">Humidity</SelectItem>
                                      <SelectItem value="switch">Switch</SelectItem>
                                      <SelectItem value="gauge">Gauge</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={widgetForm.control}
                              name="deviceId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Device</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select device" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {devices.map((device) => (
                                        <SelectItem key={device.id} value={device.id}>
                                          {device.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit">Add Widget</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    <Button onClick={handleSaveDashboard}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Dashboard
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleBackToEdit}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Edit
                  </Button>
                )}
              </>
            ) : (
              <Dialog open={isDashboardDialogOpen} onOpenChange={setIsDashboardDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Dashboard
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Dashboard</DialogTitle>
                    <DialogDescription>Create a new dashboard for yourself or a user</DialogDescription>
                  </DialogHeader>
                  <Form {...dashboardForm}>
                    <form onSubmit={dashboardForm.handleSubmit(onDashboardSubmit)} className="space-y-4">
                      <FormField
                        control={dashboardForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dashboard Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Main Dashboard" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={dashboardForm.control}
                        name="userId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assign to User (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select user (optional)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="admin">Admin (Me)</SelectItem>
                                {users.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit">Create Dashboard</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {dashboardId ? (
            <div className="bg-muted/20 rounded-lg p-4 min-h-[600px]">
              <ResponsiveGridLayout
                className="layout"
                layouts={{
                  lg: widgets.map((widget) => ({
                    i: widget.id,
                    x: widget.x,
                    y: widget.y,
                    w: widget.w,
                    h: widget.h,
                    minW: widget.minW,
                    minH: widget.minH,
                    isDraggable: isEditing,
                    isResizable: isEditing,
                  })),
                }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={100}
                onLayoutChange={handleLayoutChange}
              >
                {widgets.map((widget) => (
                  <div key={widget.id} className="relative">
                    <Card className="h-full">
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm flex items-center">
                          {getWidgetIcon(widget.type)}
                          <span className="ml-2">{widget.title}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 flex items-center justify-center">
                        {widget.type === "temperature" && (
                          <div className="text-center">
                            <div className="text-3xl font-bold">{widget.data.value}</div>
                            <div className="text-muted-foreground">{widget.data.unit}</div>
                          </div>
                        )}
                        {widget.type === "humidity" && (
                          <div className="text-center">
                            <div className="text-3xl font-bold">{widget.data.value}</div>
                            <div className="text-muted-foreground">{widget.data.unit}</div>
                          </div>
                        )}
                        {widget.type === "switch" && (
                          <Button variant={widget.data.state ? "default" : "outline"} className="w-full h-full">
                            {widget.data.state ? "ON" : "OFF"}
                          </Button>
                        )}
                        {widget.type === "gauge" && (
                          <div className="text-center">
                            <div className="text-3xl font-bold">{widget.data.value}</div>
                            <div className="text-muted-foreground">{widget.data.unit}</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    {isEditing && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => handleDeleteWidget(widget.id)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </ResponsiveGridLayout>
              {widgets.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                  <p>No widgets added yet</p>
                  {isEditing && (
                    <Button variant="outline" className="mt-4" onClick={() => setIsWidgetDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Widget
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
              <p>No dashboard selected</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsDashboardDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

