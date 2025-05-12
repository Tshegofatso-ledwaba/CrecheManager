import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Loader2, Search, UserCheck } from "lucide-react";

export function AttendanceTracker() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [classFilter, setClassFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: attendanceRecords, isLoading } = useQuery({
    queryKey: ["/api/attendance", selectedDate],
  });

  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
  });

  const markAttendance = async (studentId: number, present: boolean) => {
    try {
      await apiRequest("POST", "/api/attendance", {
        studentId,
        date: selectedDate,
        present,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance", selectedDate] });
      toast({
        title: "Attendance Recorded",
        description: `Student marked as ${present ? "present" : "absent"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record attendance",
        variant: "destructive",
      });
    }
  };

  const markAllPresent = async () => {
    try {
      await apiRequest("POST", "/api/attendance/mark-all", {
        date: selectedDate,
        classId: classFilter !== "all" ? classFilter : undefined,
        present: true,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance", selectedDate] });
      toast({
        title: "Attendance Recorded",
        description: "All students marked as present",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record attendance",
        variant: "destructive",
      });
    }
  };

  const filteredAttendance = attendanceRecords?.filter((record: any) => {
    const matchesClass = classFilter === "all" || record.classId === classFilter;
    const matchesSearch = 
      searchQuery === "" || 
      record.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesClass && matchesSearch;
  });

  const totalStudents = filteredAttendance?.length || 0;
  const presentStudents = filteredAttendance?.filter((record: any) => record.present).length || 0;
  const attendanceRate = totalStudents ? Math.round((presentStudents / totalStudents) * 100) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Attendance Management</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-[150px]"
          />
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-8 w-[200px]"
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
          <Button onClick={markAllPresent}>
            <UserCheck className="h-4 w-4 mr-2" />
            Mark All Present
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily">
          <TabsList className="mb-4">
            <TabsTrigger value="daily">Daily Attendance</TabsTrigger>
            <TabsTrigger value="reports">Attendance Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-6">
                <div>
                  <span className="text-sm text-gray-500">Total Students</span>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Present</span>
                  <p className="text-2xl font-bold text-green-600">{presentStudents}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Absent</span>
                  <p className="text-2xl font-bold text-red-600">{totalStudents - presentStudents}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Attendance Rate</span>
                  <p className="text-2xl font-bold">{attendanceRate}%</p>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(selectedDate).toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredAttendance?.length > 0 ? (
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class/Group
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Present
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAttendance.map((record: any) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.className}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <Checkbox
                            checked={record.present}
                            onCheckedChange={(checked) => 
                              markAttendance(record.studentId, checked === true)
                            }
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Input 
                            placeholder="Add notes (e.g., late arrival)"
                            defaultValue={record.notes || ""}
                            className="min-w-[250px]"
                            onBlur={(e) => {
                              if (e.target.value !== record.notes) {
                                apiRequest("PATCH", `/api/attendance/${record.id}`, {
                                  notes: e.target.value
                                }).then(() => {
                                  queryClient.invalidateQueries({ queryKey: ["/api/attendance", selectedDate] });
                                });
                              }
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No attendance records found for the selected date and filters.
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports">
            <div className="bg-white rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Attendance Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Overall Attendance Rate</p>
                        <p className="text-3xl font-bold">94%</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">This Week</p>
                        <p className="text-3xl font-bold">92%</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">This Month</p>
                        <p className="text-3xl font-bold">95%</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Frequent Absences</p>
                        <p className="text-3xl font-bold">3</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Generate Attendance Report</h3>
                <div className="flex items-end space-x-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input type="date" id="start-date" className="w-[150px]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input type="date" id="end-date" className="w-[150px]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report-class">Class</Label>
                    <Select>
                      <SelectTrigger id="report-class" className="w-[180px]">
                        <SelectValue placeholder="Select class" />
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
                  </div>
                  <Button>Generate Report</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
