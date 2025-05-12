import { useState, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { UserNav } from "@/components/shared/user-nav";
import { ApplicationsList } from "@/components/admin/applications-list";
import { StudentsTable } from "@/components/admin/students-table";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { FeeManagement } from "@/components/admin/fee-management";
import { AttendanceTracker } from "@/components/admin/attendance-tracker";
import { TeacherManagement } from "@/components/admin/teacher-management";
import { AnnouncementsManager } from "@/components/admin/announcements-manager";
import { Messages } from "@/components/parent/messages";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface NavButtonProps {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
}

const NavButton = ({ children, active, onClick, icon }: NavButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
        active
          ? "bg-blue-100 text-blue-700 shadow-sm"
          : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: recentActivities = [] } = useQuery<any[]>({
    queryKey: ["/api/activities"],
    initialData: [],
    refetchInterval: 30000, // Automatically refresh every 30 seconds
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-purple-700 to-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-white text-xl font-bold tracking-wide">Creche Management System</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <button
                  type="button"
                  className="p-2 rounded-full text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white mr-3"
                >
                  <span className="sr-only">View notifications</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>
                <UserNav />
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Secondary Navigation - Tab Based */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-2 scrollbar-hide">
            <div className="flex space-x-1">
              <NavButton 
                active={activeTab === "dashboard"} 
                onClick={() => setActiveTab("dashboard")}
                icon={
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                }
              >
                Dashboard
              </NavButton>
              
              <NavButton 
                active={activeTab === "applications"} 
                onClick={() => setActiveTab("applications")}
                icon={
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                }
              >
                Applications
              </NavButton>
              
              <NavButton 
                active={activeTab === "students"} 
                onClick={() => setActiveTab("students")}
                icon={
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                }
              >
                Students
              </NavButton>
              
              <NavButton 
                active={activeTab === "messaging"} 
                onClick={() => setActiveTab("messaging")}
                icon={
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                  </svg>
                }
              >
                Messaging
              </NavButton>
              
              <NavButton 
                active={activeTab === "fees"} 
                onClick={() => setActiveTab("fees")}
                icon={
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                }
              >
                Fees
              </NavButton>
              
              <NavButton 
                active={activeTab === "attendance"} 
                onClick={() => setActiveTab("attendance")}
                icon={
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
              >
                Attendance
              </NavButton>
              
              <NavButton 
                active={activeTab === "teachers"} 
                onClick={() => setActiveTab("teachers")}
                icon={
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                }
              >
                Teachers
              </NavButton>
              
              <NavButton 
                active={activeTab === "announcements"} 
                onClick={() => setActiveTab("announcements")}
                icon={
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 010 7.07" />
                    <path d="M19.07 4.93a10 10 0 010 14.14" />
                  </svg>
                }
              >
                Announcements
              </NavButton>
              
              <NavButton 
                active={activeTab === "reports"} 
                onClick={() => setActiveTab("reports")}
                icon={
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                }
              >
                Reports
              </NavButton>
            </div>
          </div>
        </div>
      </div>

      <header className="bg-gradient-to-r from-gray-50 to-blue-50 shadow-md">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 border-l-4 border-blue-500 pl-3">Admin Dashboard</h1>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Tabs value={activeTab} className="space-y-6">
            <TabsContent value="dashboard">
              <div className="px-4 py-6 sm:px-0">
                <DashboardStats />

                {/* Recent Activities */}
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-900 border-b-2 border-blue-300 pb-2 mb-4 flex items-center">
                    <svg 
                      className="h-6 w-6 mr-2 text-blue-500" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Recent Activities
                  </h2>
                  <div className="mt-4 bg-white shadow-md overflow-hidden rounded-lg border border-gray-100">
                    <ul className="divide-y divide-gray-200">
                      {recentActivities?.length ? (
                        recentActivities.map((activity: any) => (
                          <li key={activity.id} className="hover:bg-blue-50 transition-colors duration-150">
                            <div className="px-4 py-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-blue-600 truncate">
                                  {activity.title}
                                </p>
                                <div className="ml-2 flex-shrink-0 flex">
                                  <p className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {activity.type}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-600">
                                    <svg
                                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {activity.user}
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-600 sm:mt-0">
                                  <svg
                                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span>{activity.date}</span>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-5 text-center text-sm text-gray-500">
                          No recent activities
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="applications">
              <div className="px-4 sm:px-0">
                <ApplicationsList />
              </div>
            </TabsContent>

            <TabsContent value="students">
              <div className="px-4 sm:px-0">
                <StudentsTable />
              </div>
            </TabsContent>

            <TabsContent value="messaging">
              <div className="px-4 sm:px-0">
                <Card>
                  <Messages isAdmin={true} />
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="fees">
              <div className="px-4 sm:px-0">
                <FeeManagement />
              </div>
            </TabsContent>

            <TabsContent value="attendance">
              <div className="px-4 sm:px-0">
                <AttendanceTracker />
              </div>
            </TabsContent>

            <TabsContent value="teachers">
              <div className="px-4 sm:px-0">
                <TeacherManagement />
              </div>
            </TabsContent>
            
            <TabsContent value="announcements">
              <div className="px-4 sm:px-0">
                <AnnouncementsManager />
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <div className="px-4 sm:px-0 bg-white shadow-md rounded-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 border-b-2 border-blue-300 pb-2 mb-4 flex items-center">
                  <svg 
                    className="h-6 w-6 mr-2 text-blue-500" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Reports & Analytics
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 text-base">
                    Generate comprehensive reports and analyze data to gain valuable insights into the creche's operations.
                  </p>
                  
                  <div className="border border-blue-100 bg-blue-50 p-6 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 text-blue-800">Available Reports</h3>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center p-3 bg-white hover:bg-blue-50 rounded-md transition-colors duration-150 shadow-sm">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          <span className="font-medium">Student Attendance Report</span>
                        </div>
                        <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-1 rounded-full text-sm font-medium transition-colors duration-150">
                          Generate
                        </button>
                      </li>
                      <li className="flex justify-between items-center p-3 bg-white hover:bg-blue-50 rounded-md transition-colors duration-150 shadow-sm">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
                          </svg>
                          <span className="font-medium">Fee Collection Summary</span>
                        </div>
                        <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-1 rounded-full text-sm font-medium transition-colors duration-150">
                          Generate
                        </button>
                      </li>
                      <li className="flex justify-between items-center p-3 bg-white hover:bg-blue-50 rounded-md transition-colors duration-150 shadow-sm">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 14.66V20a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h5.34"></path>
                            <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
                          </svg>
                          <span className="font-medium">Application Statistics</span>
                        </div>
                        <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-1 rounded-full text-sm font-medium transition-colors duration-150">
                          Generate
                        </button>
                      </li>
                      <li className="flex justify-between items-center p-3 bg-white hover:bg-blue-50 rounded-md transition-colors duration-150 shadow-sm">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 010 7.75"></path>
                          </svg>
                          <span className="font-medium">Student Demographics</span>
                        </div>
                        <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-1 rounded-full text-sm font-medium transition-colors duration-150">
                          Generate
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
