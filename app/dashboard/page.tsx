"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Responsive, WidthProvider } from "react-grid-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Edit, Plus } from "lucide-react"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import type { DashboardWidget } from "@/types/dashboard"

const ResponsiveGridLayout = WidthProvider(Responsive)

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [dashboards, setDashboards] = useState<{ id: string; name: string }[]>([])
  const [currentDashboard, setCurrentDashboard] = useState<string | null>(null)
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])

  useEffect(() => {
    if (status === "authenticated") {
      // Fetch user's dashboards
      fetchDashboards()
    }
  }, [status])

  const fetchDashboards = async () => {
    setIsLoading(true)
    try {
      // This would be a real API call in production
      // const response = await fetch("/api/dashboards")
      // const data = await response.json()

      // Mock data for demonstration
      const mockDashboards = [
        { id: "dashboard1", name: "Main Dashboard" },
        { id: "dashboard2", name: "Device Status" },
      ]

      setDashboards(mockDashboards)

      if (mockDashboards.length > 0) {
        setCurrentDashboard(mockDashboards[0].id)
        fetchWidgets(mockDashboards[0].id)
      } else {
        setIsLoading(false)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load dashboards",
        description: "Please try again later.",
      })
      setIsLoading(false)
    }
  }

  const fetchWidgets = async (dashboardId: string) => {
    try {
      // This would be a real API call in production
      // const response = await fetch(`/api/dashboards/${dashboardId}/widgets`)
      // const data = await response.json()

      // Mock data for demonstration
      const mockWidgets = [
        {
          id: "widget1",
          type: "temperature",
          title: "Temperature Sensor",
          deviceId: "device1",
          x: 0,
          y: 0,
          w: 2,
          h: 2,
          minW: 1,
          minH: 1,
          data: { value: 22.5, unit: "°C" },
        },
        {
          id: "widget2",
          type: "humidity",
          title: "Humidity Sensor",
          deviceId: "device2",
          x: 2,
          y: 0,
          w: 2,
          h: 2,
          minW: 1,
          minH: 1,
          data: { value: 45, unit: "%" },
        },
        {
          id: "widget3",
          type: "switch",
          title: "Light Switch",
          deviceId: "device3",
          x: 0,
          y: 2,
          w: 1,
          h: 1,
          minW: 1,
          minH: 1,
          data: { state: false },
        },
      ]

      setWidgets(mockWidgets)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load widgets",
        description: "Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLayoutChange = (layout: any) => {
    if (isEditing) {
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
  }

  const toggleEditMode = () => {
    setIsEditing(!isEditing)

    if (isEditing) {
      // Save layout changes to the server
      saveLayout()
    }
  }

  const saveLayout = async () => {
    try {
      // This would be a real API call in production
      // await fetch(`/api/dashboards/${currentDashboard}/layout`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ widgets })
      // })

      toast({
        title: "Dashboard saved",
        description: "Your dashboard layout has been saved successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to save dashboard",
        description: "Please try again later.",
      })
    }
  }

  const renderWidgetContent = (widget: DashboardWidget) => {
    switch (widget.type) {
      case "temperature":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-3xl font-bold">{widget.data.value}</span>
            <span className="text-muted-foreground">{widget.data.unit}</span>
          </div>
        )
      case "humidity":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-3xl font-bold">{widget.data.value}</span>
            <span className="text-muted-foreground">{widget.data.unit}</span>
          </div>
        )
      case "switch":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Button
              variant={widget.data.state ? "default" : "outline"}
              className="w-full h-full"
              onClick={() => toggleDeviceState(widget.id, widget.deviceId)}
            >
              {widget.data.state ? "ON" : "OFF"}
            </Button>
          </div>
        )
      default:
        return <div>Unknown widget type</div>
    }
  }

  const toggleDeviceState = async (widgetId: string, deviceId: string) => {
    try {
      // This would be a real MQTT publish in production
      // await fetch(`/api/devices/${deviceId}/command`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     topic: `v1/devices/me/rpc/request/${Date.now()}`,
      //     method: "toggle",
      //     params: {}
      //   })
      // })

      // Update local state for immediate feedback
      setWidgets(
        widgets.map((widget) => {
          if (widget.id === widgetId) {
            return {
              ...widget,
              data: { ...widget.data, state: !widget.data.state },
            }
          }
          return widget
        }),
      )
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to control device",
        description: "Please try again later.",
      })
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">Please log in to view your dashboard.</p>
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{dashboards.find((d) => d.id === currentDashboard)?.name || "Dashboard"}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={toggleEditMode}>
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? "Save Layout" : "Edit Layout"}
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
        </div>
      </div>

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
        cols={{ lg: 4, md: 4, sm: 2, xs: 1, xxs: 1 }}
        rowHeight={150}
        onLayoutChange={handleLayoutChange}
      >
        {widgets.map((widget) => (
          <div key={widget.id}>
            <Card className="h-full">
              <CardHeader className="p-3">
                <CardTitle className="text-sm">{widget.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-3">{renderWidgetContent(widget)}</CardContent>
            </Card>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  )
}

