import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Calendar, 
  ChevronRight, 
  FileText 
} from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type Application = {
  id: number;
  childFirstName: string;
  childLastName: string;
  childDob: string;
  childGender: string;
  status: string;
  appliedDate: string;
  [key: string]: any;
};

export function ApplicationsTracker() {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: applications, isLoading, error } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-300">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Rejected
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50 border-yellow-300">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Pending Review
          </Badge>
        );
    }
  };

  const getStatusTimeline = (status: string) => {
    return (
      <div className="relative mt-6 pt-6">
        <div className="absolute left-0 top-0 w-full border-t border-gray-200"></div>
        <ol className="relative grid grid-cols-3 text-xs text-gray-500">
          <li className="flex flex-col items-center">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full ${status === "pending" || status === "approved" || status === "rejected" ? "bg-primary-500" : "bg-gray-200"} text-white`}>1</div>
            <div className="mt-2 text-center font-medium">Submitted</div>
          </li>
          <li className="flex flex-col items-center">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full ${status === "approved" || status === "rejected" ? "bg-primary-500" : "bg-gray-200"} text-white`}>2</div>
            <div className="mt-2 text-center font-medium">Under Review</div>
          </li>
          <li className="flex flex-col items-center">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full ${status === "approved" || status === "rejected" ? "bg-primary-500" : "bg-gray-200"} text-white`}>3</div>
            <div className="mt-2 text-center font-medium">{status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Decision"}</div>
          </li>
        </ol>
      </div>
    );
  };

  const showApplicationDetails = (application: Application) => {
    setSelectedApplication(application);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading applications: {(error as Error).message}</div>;
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
        <p className="text-gray-500 mb-6">You haven't submitted any applications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Your Applications</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {applications.map((application) => (
          <Card key={application.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">{application.childFirstName} {application.childLastName}</CardTitle>
                <CardDescription>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    <span>
                      Applied on {format(new Date(application.appliedDate), "MMMM d, yyyy")}
                    </span>
                  </div>
                </CardDescription>
              </div>
              {getStatusBadge(application.status)}
            </CardHeader>
            <CardContent>
              {getStatusTimeline(application.status)}
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Gender:</span> {application.childGender}
                </div>
                <div>
                  <span className="text-gray-500">Date of Birth:</span> {format(new Date(application.childDob), "MMM d, yyyy")}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 px-4 py-3">
              <Button 
                variant="ghost" 
                className="ml-auto text-xs text-primary"
                onClick={() => showApplicationDetails(application)}
              >
                View Details <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Application Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Submitted on {selectedApplication && format(new Date(selectedApplication.appliedDate), "MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="mt-4 space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-2">Status</h3>
                <div className="flex items-center">
                  {getStatusBadge(selectedApplication.status)}
                  {selectedApplication.status === "pending" && (
                    <span className="ml-2 text-sm text-gray-500">
                      Your application is being reviewed by our administration team.
                    </span>
                  )}
                  {selectedApplication.status === "approved" && (
                    <span className="ml-2 text-sm text-gray-500">
                      Congratulations! Your child's application has been approved.
                    </span>
                  )}
                  {selectedApplication.status === "rejected" && (
                    <span className="ml-2 text-sm text-gray-500">
                      Unfortunately, your application could not be approved at this time.
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-base font-semibold mb-2">Child Information</h3>
                  <dl className="grid grid-cols-2 gap-x-2 gap-y-3 text-sm">
                    <dt className="text-gray-500">First Name</dt>
                    <dd>{selectedApplication.childFirstName}</dd>
                    <dt className="text-gray-500">Last Name</dt>
                    <dd>{selectedApplication.childLastName}</dd>
                    <dt className="text-gray-500">Date of Birth</dt>
                    <dd>{format(new Date(selectedApplication.childDob), "MMMM d, yyyy")}</dd>
                    <dt className="text-gray-500">Gender</dt>
                    <dd className="capitalize">{selectedApplication.childGender}</dd>
                    {selectedApplication.allergies && (
                      <>
                        <dt className="text-gray-500">Allergies</dt>
                        <dd>{selectedApplication.allergies}</dd>
                      </>
                    )}
                    {selectedApplication.medicalConditions && (
                      <>
                        <dt className="text-gray-500">Medical Conditions</dt>
                        <dd>{selectedApplication.medicalConditions}</dd>
                      </>
                    )}
                    {selectedApplication.medications && (
                      <>
                        <dt className="text-gray-500">Medications</dt>
                        <dd>{selectedApplication.medications}</dd>
                      </>
                    )}
                  </dl>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-2">Emergency Contact</h3>
                  <dl className="grid grid-cols-2 gap-x-2 gap-y-3 text-sm">
                    <dt className="text-gray-500">Name</dt>
                    <dd>{selectedApplication.emergencyName}</dd>
                    <dt className="text-gray-500">Relationship</dt>
                    <dd>{selectedApplication.emergencyRelationship}</dd>
                    <dt className="text-gray-500">Phone</dt>
                    <dd>{selectedApplication.emergencyPhone}</dd>
                    {selectedApplication.emergencyEmail && (
                      <>
                        <dt className="text-gray-500">Email</dt>
                        <dd>{selectedApplication.emergencyEmail}</dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-base font-semibold mb-2">Next Steps</h3>
                {selectedApplication.status === "pending" && (
                  <p className="text-sm text-gray-600">
                    Your application is currently under review. Our administration team typically responds within 3-5 business days.
                    You'll receive a notification when there's an update to your application status.
                  </p>
                )}
                {selectedApplication.status === "approved" && (
                  <p className="text-sm text-gray-600">
                    Your child has been successfully enrolled! Please check your messages for further instructions
                    regarding class placement, orientation dates, and any required documents or payments.
                  </p>
                )}
                {selectedApplication.status === "rejected" && (
                  <p className="text-sm text-gray-600">
                    We're sorry that we couldn't approve your application at this time. This could be due to 
                    capacity limitations or other requirements. Please contact our administration for more details
                    and to discuss your options going forward.
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}