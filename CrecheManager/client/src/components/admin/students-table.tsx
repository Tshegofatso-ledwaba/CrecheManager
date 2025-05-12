import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, UserPlus } from "lucide-react";

export function StudentsTable() {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [classFilter, setClassFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: students, isLoading } = useQuery({
    queryKey: ["/api/students"],
  });

  const { data: selectedStudent, isLoading: isLoadingStudent } = useQuery({
    queryKey: ["/api/students", selectedStudentId],
    enabled: selectedStudentId !== null,
  });

  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
  });

  const handleViewStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setViewOpen(true);
  };

  const updateStudentClass = async (studentId: number, classId: string) => {
    try {
      await apiRequest("PATCH", `/api/students/${studentId}`, { classId });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students", studentId] });
      toast({
        title: "Student Updated",
        description: "Student's class has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student's class",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = students?.filter((student: any) => {
    const matchesClass = classFilter === "all" || student.classId === classFilter;
    const matchesSearch = 
      searchQuery === "" || 
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesClass && matchesSearch;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Student Management</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes?.map((cls: any) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredStudents?.length > 0 ? (
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class/Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
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
                {filteredStudents.map((student: any) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.className}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.enrollmentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.parentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={student.status === "active" ? "bg-green-500" : "bg-yellow-500"}>
                        {student.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        onClick={() => handleViewStudent(student.id)}
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
            No students match the selected filters.
          </div>
        )}

        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
              <DialogDescription>
                View and manage student information
              </DialogDescription>
            </DialogHeader>

            {isLoadingStudent ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : selectedStudent ? (
              <Tabs defaultValue="profile">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="medical">Medical</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Student Information</h3>
                      <dl className="grid grid-cols-3 gap-x-4 gap-y-2">
                        <dt className="text-sm font-medium text-gray-500">First Name:</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{selectedStudent.firstName}</dd>

                        <dt className="text-sm font-medium text-gray-500">Last Name:</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{selectedStudent.lastName}</dd>

                        <dt className="text-sm font-medium text-gray-500">Date of Birth:</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          {new Date(selectedStudent.dob).toLocaleDateString()}
                        </dd>

                        <dt className="text-sm font-medium text-gray-500">Gender:</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{selectedStudent.gender}</dd>

                        <dt className="text-sm font-medium text-gray-500">Current Class:</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          <Select 
                            defaultValue={selectedStudent.classId}
                            onValueChange={(value) => updateStudentClass(selectedStudent.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes?.map((cls: any) => (
                                <SelectItem key={cls.id} value={cls.id}>
                                  {cls.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </dd>

                        <dt className="text-sm font-medium text-gray-500">Status:</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          <Badge className={selectedStudent.status === "active" ? "bg-green-500" : "bg-yellow-500"}>
                            {selectedStudent.status}
                          </Badge>
                        </dd>
                      </dl>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Parent Information</h3>
                      <dl className="grid grid-cols-3 gap-x-4 gap-y-2">
                        <dt className="text-sm font-medium text-gray-500">Name:</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{selectedStudent.parentName}</dd>

                        <dt className="text-sm font-medium text-gray-500">Email:</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{selectedStudent.parentEmail}</dd>

                        <dt className="text-sm font-medium text-gray-500">Phone:</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{selectedStudent.parentPhone}</dd>
                      </dl>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="medical" className="space-y-4">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Medical Information</h3>
                      <dl className="grid grid-cols-3 gap-x-4 gap-y-2">
                        <dt className="text-sm font-medium text-gray-500">Allergies:</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          {selectedStudent.allergies || "None"}
                        </dd>

                        <dt className="text-sm font-medium text-gray-500">Medical Conditions:</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          {selectedStudent.medicalConditions || "None"}
                        </dd>

                        <dt className="text-sm font-medium text-gray-500">Medications:</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          {selectedStudent.medications || "None"}
                        </dd>
                      </dl>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
                      <dl className="grid grid-cols-3 gap-x-4 gap-y-2">
                        <dt className="text-sm font-medium text-gray-500">Name:</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{selectedStudent.emergencyName}</dd>

                        <dt className="text-sm font-medium text-gray-500">Relationship:</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{selectedStudent.emergencyRelationship}</dd>

                        <dt className="text-sm font-medium text-gray-500">Phone:</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{selectedStudent.emergencyPhone}</dd>
                      </dl>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <h3 className="text-lg font-medium mb-4">Student Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedStudent.documents?.map((doc: any) => (
                      <div key={doc.id} className="border rounded p-3">
                        <p className="text-sm font-medium mb-1">{doc.type}</p>
                        <p className="text-xs text-gray-500 mb-2">Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                        <Button variant="outline" size="sm" className="w-full">
                          View Document
                        </Button>
                      </div>
                    ))}
                    {!selectedStudent.documents?.length && (
                      <p className="text-sm text-gray-500">No documents available.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <p className="text-center py-4">Student details not found.</p>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewOpen(false)}>
                Close
              </Button>
              <Button>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
