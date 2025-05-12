import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Form schema for adding/editing a teacher
const teacherFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  qualification: z.string().min(2, "Qualification must be at least 2 characters"),
  classId: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

type TeacherFormValues = z.infer<typeof teacherFormSchema>;

export function TeacherManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  // Fetch teachers
  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery<any[]>({
    queryKey: ["/api/teachers"],
    initialData: [],
  });

  // Fetch classes for the dropdown
  const { data: classes = [], isLoading: isLoadingClasses } = useQuery<any[]>({
    queryKey: ["/api/classes"],
    initialData: [],
  });

  // Form for adding a new teacher
  const addTeacherForm = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      qualification: "",
      classId: undefined,
      status: "active",
    },
  });

  // Form for editing a teacher
  const editTeacherForm = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      qualification: "",
      classId: undefined,
      status: "active",
    },
  });

  // Add teacher mutation
  const addTeacherMutation = useMutation({
    mutationFn: async (data: TeacherFormValues) => {
      const res = await apiRequest("POST", "/api/teachers", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Teacher added successfully",
      });
      setIsAddTeacherOpen(false);
      addTeacherForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update teacher mutation
  const updateTeacherMutation = useMutation({
    mutationFn: async (data: TeacherFormValues & { id: number }) => {
      const { id, ...teacherData } = data;
      const res = await apiRequest("PATCH", `/api/teachers/${id}`, teacherData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Teacher updated successfully",
      });
      setIsEditTeacherOpen(false);
      editTeacherForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change teacher status mutation
  const changeStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/teachers/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Teacher status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle adding a new teacher
  const onAddTeacherSubmit = (data: TeacherFormValues) => {
    addTeacherMutation.mutate(data);
  };

  // Handle editing a teacher
  const onEditTeacherSubmit = (data: TeacherFormValues) => {
    if (selectedTeacher) {
      updateTeacherMutation.mutate({ ...data, id: selectedTeacher.id });
    }
  };

  // Open the edit teacher dialog
  const handleEditTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    editTeacherForm.reset({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || "",
      qualification: teacher.qualification,
      classId: teacher.classId ? String(teacher.classId) : undefined,
      status: teacher.status,
    });
    setIsEditTeacherOpen(true);
  };

  // Handle changing teacher status
  const handleChangeStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    changeStatusMutation.mutate({ id, status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Teacher Management</h2>
        <Dialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add New Teacher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new teacher to the system.
              </DialogDescription>
            </DialogHeader>
            <Form {...addTeacherForm}>
              <form onSubmit={addTeacherForm.handleSubmit(onAddTeacherSubmit)} className="space-y-4">
                <FormField
                  control={addTeacherForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addTeacherForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="teacher@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addTeacherForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+27 123 456 7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addTeacherForm.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualifications</FormLabel>
                      <FormControl>
                        <Input placeholder="Bachelor of Education" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addTeacherForm.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes?.map((cls: any) => (
                            <SelectItem key={cls.id} value={String(cls.id)}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={addTeacherMutation.isPending}>
                    {addTeacherMutation.isPending ? "Adding..." : "Add Teacher"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTeachers ? (
            <div className="flex justify-center p-4">Loading teachers...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Assigned Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers?.length > 0 ? (
                  teachers.map((teacher: any) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.phone || "—"}</TableCell>
                      <TableCell>{teacher.qualification}</TableCell>
                      <TableCell>{teacher.className || "Not assigned"}</TableCell>
                      <TableCell>
                        <Badge
                          className={teacher.status === "active" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}
                        >
                          {teacher.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTeacher(teacher)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={teacher.status === "active" ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleChangeStatus(teacher.id, teacher.status)}
                          >
                            {teacher.status === "active" ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No teachers found. Add your first teacher to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Teacher Dialog */}
      <Dialog open={isEditTeacherOpen} onOpenChange={setIsEditTeacherOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>
              Update the teacher's information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editTeacherForm}>
            <form onSubmit={editTeacherForm.handleSubmit(onEditTeacherSubmit)} className="space-y-4">
              <FormField
                control={editTeacherForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editTeacherForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editTeacherForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editTeacherForm.control}
                name="qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualifications</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editTeacherForm.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Class</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes?.map((cls: any) => (
                          <SelectItem key={cls.id} value={String(cls.id)}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editTeacherForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateTeacherMutation.isPending}>
                  {updateTeacherMutation.isPending ? "Updating..." : "Update Teacher"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}