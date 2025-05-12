import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, FileText, Loader2, Plus, Search } from "lucide-react";

export function FeeManagement() {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [showAddFee, setShowAddFee] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: fees, isLoading } = useQuery({
    queryKey: ["/api/fees"],
  });

  const { data: students } = useQuery({
    queryKey: ["/api/students"],
  });

  const markAsPaid = async (feeId: number) => {
    try {
      await apiRequest("PATCH", `/api/fees/${feeId}`, { status: "paid" });
      queryClient.invalidateQueries({ queryKey: ["/api/fees"] });
      toast({
        title: "Fee Updated",
        description: "Fee marked as paid successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update fee status",
        variant: "destructive",
      });
    }
  };

  const addNewFee = async (data: any) => {
    try {
      await apiRequest("POST", "/api/fees", data);
      queryClient.invalidateQueries({ queryKey: ["/api/fees"] });
      setShowAddFee(false);
      toast({
        title: "Fee Added",
        description: "New fee has been added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add new fee",
        variant: "destructive",
      });
    }
  };

  const sendReminder = async (feeId: number) => {
    try {
      await apiRequest("POST", `/api/fees/${feeId}/remind`, {});
      toast({
        title: "Reminder Sent",
        description: "Payment reminder has been sent to the parent",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send payment reminder",
        variant: "destructive",
      });
    }
  };

  const filteredFees = fees?.filter((fee: any) => {
    const matchesStatus = statusFilter === "all" || fee.status === statusFilter;
    const matchesSearch = 
      searchQuery === "" || 
      fee.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fee Management</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAddFee(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Fee
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="fees">
          <TabsList className="mb-4">
            <TabsTrigger value="fees">Fee Transactions</TabsTrigger>
            <TabsTrigger value="summary">Summary Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="fees">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredFees?.length > 0 ? (
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFees.map((fee: any) => (
                      <tr key={fee.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {fee.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {fee.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${fee.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(fee.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={
                              fee.status === "paid"
                                ? "bg-green-500"
                                : fee.status === "overdue"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            }
                          >
                            {fee.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {fee.status !== "paid" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => markAsPaid(fee.id)}
                                >
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  Mark Paid
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => sendReminder(fee.id)}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Send Reminder
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No fee records match the selected filters.
              </div>
            )}
          </TabsContent>

          <TabsContent value="summary">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Collected:</span>
                      <span className="text-sm font-bold">${(fees?.filter((f: any) => f.status === "paid").reduce((acc: number, fee: any) => acc + fee.amount, 0) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Pending Payment:</span>
                      <span className="text-sm font-bold">${(fees?.filter((f: any) => f.status === "pending").reduce((acc: number, fee: any) => acc + fee.amount, 0) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Overdue:</span>
                      <span className="text-sm font-bold text-red-500">${(fees?.filter((f: any) => f.status === "overdue").reduce((acc: number, fee: any) => acc + fee.amount, 0) || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fee Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Payment Rate:</span>
                      <span className="text-sm font-bold">
                        {fees?.length 
                          ? Math.round((fees.filter((f: any) => f.status === "paid").length / fees.length) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Pending Payments:</span>
                      <span className="text-sm font-bold">{fees?.filter((f: any) => f.status === "pending").length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Overdue Payments:</span>
                      <span className="text-sm font-bold text-red-500">{fees?.filter((f: any) => f.status === "overdue").length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Fee Dialog */}
        <Dialog open={showAddFee} onOpenChange={setShowAddFee}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Fee</DialogTitle>
              <DialogDescription>
                Create a new fee record for a student
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  studentId: Number(formData.get("studentId")),
                  description: formData.get("description") as string,
                  amount: Number(formData.get("amount")),
                  dueDate: formData.get("dueDate") as string,
                };
                addNewFee(data);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="studentId">Student</Label>
                <Select name="studentId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map((student: any) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.firstName} {student.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Monthly tuition fee, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  required
                />
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowAddFee(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Fee</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
