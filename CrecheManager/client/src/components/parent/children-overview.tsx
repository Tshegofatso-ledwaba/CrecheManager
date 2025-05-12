import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Child as ChildSchema } from "@shared/schema";

// Extend the database schema type with UI-specific properties
interface ChildWithUI extends ChildSchema {
  className?: string;
}

interface ChildrenOverviewProps {
  children: ChildWithUI[];
}

export function ChildrenOverview({ children }: ChildrenOverviewProps) {
  const [selectedChild, setSelectedChild] = useState<ChildWithUI | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const handleViewDetails = (child: ChildWithUI) => {
    setSelectedChild(child);
    setViewOpen(true);
  };

  const calculateAge = (dob: Date | string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} ${age === 1 ? 'year' : 'years'} old`;
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">My Children</h3>
          <div className="mt-2 space-y-4">
            {children.length > 0 ? (
              children.map((child) => (
                <div key={child.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-md font-medium text-gray-900">
                        {child.firstName} {child.lastName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {child.className || "No class assigned"} ({calculateAge(child.dob)})
                      </p>
                    </div>
                    <Badge className={child.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {child.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex space-x-2">
                    <Button variant="link" className="p-0 h-auto text-sm text-primary" onClick={() => handleViewDetails(child)}>
                      View Details
                    </Button>
                    <Button variant="link" className="p-0 h-auto text-sm text-primary">
                      Attendance Record
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No children enrolled yet.</p>
                <p className="text-sm mt-1">Submit an application to enroll your child.</p>
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            {children.length > 0 && (
              <Button variant="link" className="text-primary">
                View All Children
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedChild?.firstName} {selectedChild?.lastName}
            </DialogTitle>
            <DialogDescription>
              Child Details and Information
            </DialogDescription>
          </DialogHeader>
          
          {selectedChild && (
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="medical">Medical</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-3 gap-x-4 gap-y-2 mt-4">
                  <span className="text-sm font-medium text-gray-500">Age:</span>
                  <span className="text-sm text-gray-900 col-span-2">{calculateAge(selectedChild.dob)}</span>
                  
                  <span className="text-sm font-medium text-gray-500">Date of Birth:</span>
                  <span className="text-sm text-gray-900 col-span-2">{new Date(selectedChild.dob).toLocaleDateString()}</span>
                  
                  <span className="text-sm font-medium text-gray-500">Gender:</span>
                  <span className="text-sm text-gray-900 col-span-2">{selectedChild.gender}</span>
                  
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className="text-sm col-span-2">
                    <Badge className={selectedChild.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {selectedChild.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </span>
                  
                  <span className="text-sm font-medium text-gray-500">Class:</span>
                  <span className="text-sm text-gray-900 col-span-2">{selectedChild.className || "No class assigned"}</span>
                </div>
              </TabsContent>
              
              <TabsContent value="medical" className="space-y-4">
                <div className="grid grid-cols-3 gap-x-4 gap-y-2 mt-4">
                  <span className="text-sm font-medium text-gray-500">Allergies:</span>
                  <span className="text-sm text-gray-900 col-span-2">{selectedChild.allergies || "None"}</span>
                  
                  <span className="text-sm font-medium text-gray-500">Medical Conditions:</span>
                  <span className="text-sm text-gray-900 col-span-2">{selectedChild.medicalConditions || "None"}</span>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
