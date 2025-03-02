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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Plus, Edit, Trash } from "lucide-react"

const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["user", "admin"], { message: "Please select a valid role" }),
})

type User = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  createdAt: string
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  })

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/dashboard")
        return
      }
      fetchUsers()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  useEffect(() => {
    if (editingUser) {
      form.reset({
        name: editingUser.name,
        email: editingUser.email,
        password: "", // Don't populate password for security
        role: editingUser.role,
      })
    } else {
      form.reset({
        name: "",
        email: "",
        password: "",
        role: "user",
      })
    }
  }, [editingUser, form])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      // This would be a real API call in production
      // const response = await fetch("/api/users")
      // const data = await response.json()

      // Mock data for demonstration
      const mockUsers: User[] = [
        {
          id: "1",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Test User",
          email: "user@example.com",
          role: "user",
          createdAt: new Date().toISOString(),
        },
      ]

      setUsers(mockUsers)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load users",
        description: "Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof userFormSchema>) => {
    try {
      if (editingUser) {
        // Update existing user
        // This would be a real API call in production
        // await fetch(`/api/users/${editingUser.id}`, {
        //   method: "PUT",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(values),
        // })

        // Update local state
        setUsers(
          users.map((user) =>
            user.id === editingUser.id ? { ...user, name: values.name, email: values.email, role: values.role } : user,
          ),
        )

        toast({
          title: "User updated",
          description: "User has been updated successfully.",
        })
      } else {
        // Create new user
        // This would be a real API call in production
        // const response = await fetch("/api/users", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(values),
        // })
        // const newUser = await response.json()

        // Mock new user for demonstration
        const newUser: User = {
          id: Date.now().toString(),
          name: values.name,
          email: values.email,
          role: values.role,
          createdAt: new Date().toISOString(),
        }

        // Update local state
        setUsers([...users, newUser])

        toast({
          title: "User created",
          description: "New user has been created successfully.",
        })
      }

      setIsDialogOpen(false)
      setEditingUser(null)
      form.reset()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to save user",
        description: "Please try again later.",
      })
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsDialogOpen(true)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      // This would be a real API call in production
      // await fetch(`/api/users/${userId}`, {
      //   method: "DELETE",
      // })

      // Update local state
      setUsers(users.filter((user) => user.id !== userId))

      toast({
        title: "User deleted",
        description: "User has been deleted successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete user",
        description: "Please try again later.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage user accounts</CardDescription>
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
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage user accounts</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingUser(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
                <DialogDescription>
                  {editingUser ? "Update user details" : "Create a new user account"}
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
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" {...field} />
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
                        <FormLabel>{editingUser ? "New Password (leave blank to keep current)" : "Password"}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">{editingUser ? "Update User" : "Create User"}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
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

