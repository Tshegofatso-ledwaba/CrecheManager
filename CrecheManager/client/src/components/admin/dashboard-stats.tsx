import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, UsersRound, FileText, Clock, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export function DashboardStats() {
  const today = new Date();
  const formattedDate = format(today, "MMMM d, yyyy");
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Automatically refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const cardData = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: <UsersRound className="h-6 w-6 text-white" />,
      bgColor: "bg-primary-500",
      link: "Manage students",
      href: "/admin-dashboard?section=students",
    },
    {
      title: "Pending Applications",
      value: stats?.pendingApplications || 0,
      icon: <FileText className="h-6 w-6 text-white" />,
      bgColor: "bg-secondary-500",
      link: "Process applications",
      href: "/admin-dashboard?section=applications",
    },
    {
      title: "Attendance Today",
      value: `${stats?.attendanceToday || 0}/${stats?.totalStudents || 0}`,
      icon: <Clock className="h-6 w-6 text-white" />,
      bgColor: "bg-green-500",
      link: "View attendance",
      href: "/admin-dashboard?section=attendance",
    },
    {
      title: "Pending Fee Payments",
      value: stats?.pendingFees || 0,
      icon: <DollarSign className="h-6 w-6 text-white" />,
      bgColor: "bg-red-500",
      link: "View fee status",
      href: "/admin-dashboard?section=fees",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard Overview</h2>
        <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="text-sm">{formattedDate}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cardData.map((card, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${card.bgColor} rounded-md p-3`}>
                  {card.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{card.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a 
                  href={card.href} 
                  className="text-primary-600 hover:text-primary-500 font-medium transition-colors flex items-center"
                >
                  {card.link}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 ml-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      </div>
    </div>
  );
}
