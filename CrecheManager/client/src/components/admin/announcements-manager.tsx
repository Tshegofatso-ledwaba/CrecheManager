import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MegaphoneIcon, PencilIcon, ArchiveIcon, EyeIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Form schema for creating/editing an announcement
const announcementFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  targetAudience: z.enum(["all", "parents", "staff"]).default("all"),
  publishDate: z.date().default(() => new Date()),
  expiryDate: z.date().optional(),
  status: z.enum(["draft", "active", "archived"]).default("active"),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

export function AnnouncementsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
  const [isViewAnnouncementOpen, setIsViewAnnouncementOpen] = useState(false);
  const [isEditAnnouncementOpen, setIsEditAnnouncementOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

  // Fetch announcements
  const { data: announcements = [], isLoading: isLoadingAnnouncements } = useQuery<any[]>({
    queryKey: ["/api/announcements"],
    initialData: [],
  });

  // Form for adding a new announcement
  const addAnnouncementForm = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: "",
      content: "",
      targetAudience: "all",
      publishDate: new Date(),
      status: "active",
    },
  });

  // Form for editing an announcement
  const editAnnouncementForm = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: "",
      content: "",
      targetAudience: "all",
      publishDate: new Date(),
      status: "active",
    },
  });

  // Add announcement mutation
  const addAnnouncementMutation = useMutation({
    mutationFn: async (data: AnnouncementFormValues) => {
      // Format dates properly for the API
      const formattedData = {
        ...data,
        publishDate: data.publishDate.toISOString(),
        expiryDate: data.expiryDate ? data.expiryDate.toISOString() : undefined,
      };
      const res = await apiRequest("POST", "/api/announcements", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
      setIsAddAnnouncementOpen(false);
      addAnnouncementForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update announcement mutation
  const updateAnnouncementMutation = useMutation({
    mutationFn: async (data: AnnouncementFormValues & { id: number }) => {
      const { id, ...announcementData } = data;
      // Format dates properly for the API
      const formattedData = {
        ...announcementData,
        publishDate: announcementData.publishDate.toISOString(),
        expiryDate: announcementData.expiryDate ? announcementData.expiryDate.toISOString() : undefined,
      };
      const res = await apiRequest("PATCH", `/api/announcements/${id}`, formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
      setIsEditAnnouncementOpen(false);
      editAnnouncementForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change announcement status mutation
  const changeStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/announcements/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Announcement status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle adding a new announcement
  const onAddAnnouncementSubmit = (data: AnnouncementFormValues) => {
    addAnnouncementMutation.mutate(data);
  };

  // Handle editing an announcement
  const onEditAnnouncementSubmit = (data: AnnouncementFormValues) => {
    if (selectedAnnouncement) {
      updateAnnouncementMutation.mutate({ ...data, id: selectedAnnouncement.id });
    }
  };

  // Open the view announcement dialog
  const handleViewAnnouncement = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setIsViewAnnouncementOpen(true);
  };

  // Open the edit announcement dialog
  const handleEditAnnouncement = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    editAnnouncementForm.reset({
      title: announcement.title,
      content: announcement.content,
      targetAudience: announcement.targetAudience,
      publishDate: new Date(announcement.publishDate),
      expiryDate: announcement.expiryDate ? new Date(announcement.expiryDate) : undefined,
      status: announcement.status,
    });
    setIsEditAnnouncementOpen(true);
  };

  // Handle archiving an announcement
  const handleArchiveAnnouncement = (id: number) => {
    changeStatusMutation.mutate({ id, status: "archived" });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
        <Dialog open={isAddAnnouncementOpen} onOpenChange={setIsAddAnnouncementOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary">
              <MegaphoneIcon className="mr-2 h-4 w-4" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">Create New Announcement</DialogTitle>
              <DialogDescription>
                Compose a new announcement to share with parents or staff.
              </DialogDescription>
            </DialogHeader>
            <Form {...addAnnouncementForm}>
              <form onSubmit={addAnnouncementForm.handleSubmit(onAddAnnouncementSubmit)} className="space-y-5 py-2">
                <FormField
                  control={addAnnouncementForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter announcement title" 
                          className="h-12 text-base" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addAnnouncementForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter announcement content..." 
                          className="min-h-[150px] text-base leading-relaxed resize-y" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid md:grid-cols-2 gap-5">
                  <FormField
                    control={addAnnouncementForm.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Target Audience</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Select target audience" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="parents">Parents Only</SelectItem>
                            <SelectItem value="staff">Staff Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addAnnouncementForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-5">
                  <FormField
                    control={addAnnouncementForm.control}
                    name="publishDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-base font-semibold">Publish Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "h-12 pl-3 text-left font-normal text-base",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addAnnouncementForm.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-base font-semibold">Expiry Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "h-12 pl-3 text-left font-normal text-base",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={addAnnouncementMutation.isPending} 
                    className="h-12 px-8 text-base"
                  >
                    {addAnnouncementMutation.isPending ? "Posting..." : "Post Announcement"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAnnouncements ? (
            <div className="flex justify-center p-4">Loading announcements...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements?.length > 0 ? (
                  announcements.map((announcement: any) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">{announcement.title}</TableCell>
                      <TableCell>{announcement.authorName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {announcement.targetAudience === 'all' 
                            ? 'Everyone' 
                            : announcement.targetAudience === 'parents' 
                              ? 'Parents' 
                              : 'Staff'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(announcement.publishDate)}</TableCell>
                      <TableCell>
                        {announcement.expiryDate 
                          ? formatDate(announcement.expiryDate) 
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            announcement.status === "active"
                              ? "bg-green-500 hover:bg-green-600"
                              : announcement.status === "draft"
                                ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                : "bg-gray-500 hover:bg-gray-600"
                          }
                        >
                          {announcement.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAnnouncement(announcement)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAnnouncement(announcement)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          {announcement.status !== "archived" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleArchiveAnnouncement(announcement.id)}
                            >
                              <ArchiveIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No announcements found. Create your first announcement to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Announcement Dialog */}
      <Dialog open={isViewAnnouncementOpen} onOpenChange={setIsViewAnnouncementOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription>
              Posted by {selectedAnnouncement?.authorName} on {selectedAnnouncement && formatDate(selectedAnnouncement.publishDate)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between">
              <Badge variant="outline">
                Target: {selectedAnnouncement?.targetAudience === 'all' 
                  ? 'Everyone' 
                  : selectedAnnouncement?.targetAudience === 'parents' 
                    ? 'Parents' 
                    : 'Staff'}
              </Badge>
              <Badge
                className={
                  selectedAnnouncement?.status === "active"
                    ? "bg-green-500 hover:bg-green-600"
                    : selectedAnnouncement?.status === "draft"
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-gray-500 hover:bg-gray-600"
                }
              >
                {selectedAnnouncement?.status}
              </Badge>
            </div>
            <div className="bg-secondary/20 p-4 rounded-md whitespace-pre-wrap">
              {selectedAnnouncement?.content}
            </div>
            {selectedAnnouncement?.expiryDate && (
              <p className="text-sm text-muted-foreground">
                Expires on: {formatDate(selectedAnnouncement.expiryDate)}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Announcement Dialog */}
      <Dialog open={isEditAnnouncementOpen} onOpenChange={setIsEditAnnouncementOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Edit Announcement</DialogTitle>
            <DialogDescription>
              Update the announcement details.
            </DialogDescription>
          </DialogHeader>
          <Form {...editAnnouncementForm}>
            <form onSubmit={editAnnouncementForm.handleSubmit(onEditAnnouncementSubmit)} className="space-y-5 py-2">
              <FormField
                control={editAnnouncementForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Title</FormLabel>
                    <FormControl>
                      <Input 
                        className="h-12 text-base" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editAnnouncementForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="min-h-[150px] text-base leading-relaxed resize-y" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editAnnouncementForm.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Target Audience</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="parents">Parents Only</SelectItem>
                        <SelectItem value="staff">Staff Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-5">
                <FormField
                  control={editAnnouncementForm.control}
                  name="publishDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-base font-semibold">Publish Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "h-12 pl-3 text-left font-normal text-base",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editAnnouncementForm.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-base font-semibold">Expiry Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "h-12 pl-3 text-left font-normal text-base",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editAnnouncementForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button 
                  type="submit" 
                  disabled={updateAnnouncementMutation.isPending}
                  className="h-12 px-8 text-base"
                >
                  {updateAnnouncementMutation.isPending ? "Updating..." : "Update Announcement"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}