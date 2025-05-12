import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/shared/user-nav";
import { ChildrenOverview } from "@/components/parent/children-overview";
import { ApplicationForm } from "@/components/parent/application-form";
import { ApplicationsTracker } from "@/components/parent/applications-tracker";
import { FeePayments } from "@/components/parent/fee-payments";
import { Messages } from "@/components/parent/messages";
import { Bell, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Child, Notification } from "@shared/schema";

export default function ParentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const { data: children = [] } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Creche Management System</h1>
          <div className="flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="border-b border-gray-200 w-full justify-start space-x-8">
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="applications" 
                className="data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                Applications
              </TabsTrigger>
              <TabsTrigger 
                value="messages" 
                className="data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                Messages
              </TabsTrigger>
              <TabsTrigger 
                value="fees" 
                className="data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                Fee Payments
              </TabsTrigger>
              <TabsTrigger 
                value="documents" 
                className="data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Quick Actions Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Quick Actions</h3>
                    <div className="mt-5 grid grid-cols-1 gap-4">
                      <Button 
                        className="bg-primary hover:bg-primary/90" 
                        onClick={() => {
                          setActiveTab("applications");
                          setShowApplicationForm(true);
                        }}
                      >
                        New Child Application
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setActiveTab("fees")}
                      >
                        View Fee Statement
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setActiveTab("messages")}
                      >
                        Contact Administration
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Children Overview Card */}
                <ChildrenOverview children={children} />

                {/* Notifications Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Notifications</h3>
                    <div className="mt-5 flow-root">
                      <ul className="-my-4 divide-y divide-gray-200">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <li key={notification.id} className="py-4">
                              <div className="flex items-start">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                  <p className="text-sm text-gray-500">{notification.message}</p>
                                  <p className="mt-1 text-xs text-gray-400">
                                    {new Date(notification.date || notification.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </li>
                          ))
                        ) : (
                          <li className="py-4 text-center text-sm text-gray-500">
                            No new notifications
                          </li>
                        )}
                      </ul>
                    </div>
                    <div className="mt-6 text-center">
                      <Button variant="link" className="text-primary">
                        View All Notifications
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="applications" className="mt-6">
              {showApplicationForm ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">New Child Application</h2>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowApplicationForm(false)}
                    >
                      <ChevronUp className="h-5 w-5 mr-1" />
                      Hide Form
                    </Button>
                  </div>
                  <ApplicationForm onComplete={() => setShowApplicationForm(false)} />
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Applications Tracker */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <ApplicationsTracker />
                  </div>
                  
                  {/* New Application Button */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-center py-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Submit Another Application</h3>
                      <p className="text-gray-500 mb-6">Apply for enrollment of another child</p>
                      <Button onClick={() => setShowApplicationForm(true)}>
                        Start New Application
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="messages" className="mt-6">
              <Messages />
            </TabsContent>

            <TabsContent value="fees" className="mt-6">
              <FeePayments />
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium mb-4">Document Repository</h2>
                <div className="space-y-4">
                  <p className="text-gray-500">View and download important documents for your children.</p>
                  
                  {/* This would be populated with actual documents */}
                  <div className="border rounded-md p-4 text-center text-gray-500">
                    No documents available at this time.
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">&copy; 2023 Creche Management System. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Button variant="link" className="text-gray-500 hover:text-gray-900">
                Privacy Policy
              </Button>
              <Button variant="link" className="text-gray-500 hover:text-gray-900">
                Terms of Service
              </Button>
              <Button variant="link" className="text-gray-500 hover:text-gray-900">
                Contact
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
