"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Plus, Edit, Trash, RefreshCw, Wifi, WifiOff } from "lucide-react"

const deviceFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  deviceId: z.string().min(2, { message: "Device ID must be at least 2 characters" }),
  username: z.string().min(2, { message: "Username must be at least 2 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type Device = {
  id: string
  name: string
  deviceId: string
  username: string
  status: "online" | "offline"
  lastActivity: string
}

export default function DevicesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)

  const form = useForm<z.infer<typeof deviceFormSchema>>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: {
      name: "",
      deviceId: "",
      username: "",
      password: "",
    },
  })

  useEffect(() => {
    if (status === "authenticated") {
      fetchDevices()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (editingDevice) {
      form.reset({
        name: editingDevice.name,
        deviceId: editingDevice.deviceId,
        username: editingDevice.username,
        password: "", // Don't populate password for security
      })
    } else {
      form.reset({
        name: "",
        deviceId: "",
        username: "",
        password: "",
      })
    }
  }, [editingDevice, form])

  const fetchDevices = async () => {
    setIsLoading(true)
    try {
      // This would be a real API call in production
      // const response = await fetch("/api/devices")
      // const data = await response.json()

      // Mock data for demonstration
      const mockDevices: Device[] = [
        {
          id: "1",
          name: "Temperature Sensor",
          deviceId: "temp-sensor-01",
          username: "temp-sensor",
          status: "online",
          lastActivity: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Humidity Sensor",
          deviceId: "humidity-sensor-01",
          username: "humidity-sensor",
          status: "online",
          lastActivity: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Light Switch",
          deviceId: "light-switch-01",
          username: "light-switch",
          status: "offline",
          lastActivity: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
      ]

      setDevices(mockDevices)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load devices",
        description: "Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof deviceFormSchema>) => {
    try {
      if (editingDevice) {
        // Update existing device
        // This would be a real API call in production
        // await fetch(`/api/devices/${editingDevice.id}`, {
        //   method: "PUT",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(values),
        // })

        // Update local state
        setDevices(
          devices.map((device) =>
            device.id === editingDevice.id
              ? { ...device, name: values.name, deviceId: values.deviceId, username: values.username }
              : device,
          ),
        )

        toast({
          title: "Device updated",
          description: "Device has been updated successfully.",
        })
      } else {
        // Create new device
        // This would be a real API call in production
        // const response = await fetch("/api/devices", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(values),
        // })
        // const newDevice = await response.json()

        // Mock new device for demonstration
        const newDevice: Device = {
          id: Date.now().toString(),
          name: values.name,
          deviceId: values.deviceId,
          username: values.username,
          status: "offline",
          lastActivity: new Date().toISOString(),
        }

        // Update local state
        setDevices([...devices, newDevice])

        toast({
          title: "Device created",
          description: "New device has been created successfully.",
        })
      }

      setIsDialogOpen(false)
      setEditingDevice(null)
      form.reset()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to save device",
        description: "Please try again later.",
      })
    }
  }

  const handleEdit = (device: Device) => {
    setEditingDevice(device)
    setIsDialogOpen(true)
  }

  const handleDelete = async (deviceId: string) => {
    if (!confirm("Are you sure you want to delete this device?")) return

    try {
      // This would be a real API call in production
      // await fetch(`/api/devices/${deviceId}`, {
      //   method: "DELETE",
      // })

      // Update local state
      setDevices(devices.filter((device) => device.id !== deviceId))

      toast({
        title: "Device deleted",
        description: "Device has been deleted successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete device",
        description: "Please try again later.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>Manage your connected devices</CardDescription>
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
            <CardTitle>Devices</CardTitle>
            <CardDescription>Manage your connected devices</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchDevices}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingDevice(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Device
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingDevice ? "Edit Device" : "Add Device"}</DialogTitle>
                  <DialogDescription>
                    {editingDevice ? "Update device details" : "Register a new device to connect via MQTT"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Temperature Sensor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deviceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device ID</FormLabel>
                          <FormControl>
                            <Input placeholder="temp-sensor-01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="temp-sensor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {editingDevice ? "New Password (leave blank to keep current)" : "Password"}
                          </FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">{editingDevice ? "Update Device" : "Register Device"}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Device ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell>{device.deviceId}</TableCell>
                  <TableCell>{device.username}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {device.status === "online" ? (
                        <>
                          <Wifi className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-green-500">Online</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-gray-500">Offline</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(device.lastActivity).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(device)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(device.id)}>
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

