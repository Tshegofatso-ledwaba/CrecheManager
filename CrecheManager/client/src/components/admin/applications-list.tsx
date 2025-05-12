import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function ApplicationsList() {
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["/api/applications"],
  });

  const { data: selectedApplication, isLoading: isLoadingApplication } = useQuery({
    queryKey: ["/api/applications", selectedApplicationId],
    enabled: selectedApplicationId !== null,
  });

  const updateApplicationStatus = async (applicationId: number, status: string) => {
    try {
      await apiRequest("PATCH", `/api/applications/${applicationId}`, { status });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications", applicationId] });
      toast({
        title: "Application Updated",
        description: `Application status changed to ${status}`,
      });
      setViewOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const handleViewApplication = (applicationId: number) => {
    setSelectedApplicationId(applicationId);
    setViewOpen(true);
  };

  const filteredApplications = applications?.filter((app: any) => {
    if (statusFilter === "all") return true;
    return app.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Application Management</CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Filter by status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredApplications?.length > 0 ? (
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Child Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application: any) => (
                  <tr key={application.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {application.childFirstName} {application.childLastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.parentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.childAge}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.appliedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        onClick={() => handleViewApplication(application.id)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No applications match the selected filter.
          </div>
        )}

        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Review the child's application details and update status
              </DialogDescription>
            </DialogHeader>

            {isLoadingApplication ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : selectedApplication ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Child Information</h3>
                  <dl className="grid grid-cols-3 gap-x-4 gap-y-2">
                    <dt className="text-sm font-medium text-gray-500">First Name:</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{selectedApplication.childFirstName}</dd>

                    <dt className="text-sm font-medium text-gray-500">Last Name:</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{selectedApplication.childLastName}</dd>

                    <dt className="text-sm font-medium text-gray-500">Date of Birth:</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {new Date(selectedApplication.childDob).toLocaleDateString()}
                    </dd>

                    <dt className="text-sm font-medium text-gray-500">Gender:</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{selectedApplication.childGender}</dd>

                    <dt className="text-sm font-medium text-gray-500">Allergies:</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {selectedApplication.allergies || "None"}
                    </dd>

                    <dt className="text-sm font-medium text-gray-500">Medical Conditions:</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {selectedApplication.medicalConditions || "None"}
                    </dd>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
                  <dl className="grid grid-cols-3 gap-x-4 gap-y-2">
                    <dt className="text-sm font-medium text-gray-500">Name:</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{selectedApplication.emergencyName}</dd>

                    <dt className="text-sm font-medium text-gray-500">Relationship:</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{selectedApplication.emergencyRelationship}</dd>

                    <dt className="text-sm font-medium text-gray-500">Phone:</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{selectedApplication.emergencyPhone}</dd>

                    <dt className="text-sm font-medium text-gray-500">Email:</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{selectedApplication.emergencyEmail}</dd>
                  </dl>
                </div>

                {/* Documents Section */}
                <div className="col-span-1 md:col-span-2 mt-4">
                  <h3 className="text-lg font-medium mb-4">Submitted Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedApplication.documents?.map((doc: any) => (
                      <div key={doc.id} className="border rounded p-3">
                        <p className="text-sm font-medium mb-1">{doc.type}</p>
                        <Button variant="outline" size="sm" className="w-full">
                          View Document
                        </Button>
                      </div>
                    ))}
                    {!selectedApplication.documents?.length && (
                      <p className="text-sm text-gray-500">No documents submitted yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center py-4">Application details not found.</p>
            )}

            <DialogFooter className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-3 text-sm font-medium">Current Status:</span>
                {selectedApplication && getStatusBadge(selectedApplication.status)}
              </div>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setViewOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => selectedApplicationId && updateApplicationStatus(selectedApplicationId, "rejected")}
                  disabled={selectedApplication?.status === "rejected"}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => selectedApplicationId && updateApplicationStatus(selectedApplicationId, "approved")}
                  disabled={selectedApplication?.status === "approved"}
                >
                  Approve
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
